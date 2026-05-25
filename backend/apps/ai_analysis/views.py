import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from .models import AIAnalysis, UserRecommendation
from .serializers import AIAnalysisSerializer, RecommendationSerializer


def analyze_audio_with_librosa(audio_path: str) -> dict:
    """
    Real audio analysis using librosa.
    Detects pitch, tempo, chroma features and estimates accuracy.
    HU-009, HU-010, HU-011
    """
    try:
        import librosa
        import numpy as np

        y, sr = librosa.load(audio_path, sr=None, mono=True)

        # Tempo
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

        # Pitch (fundamental frequency via pyin)
        f0, voiced_flag, _ = librosa.pyin(y, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"))
        f0_valid = f0[voiced_flag & ~np.isnan(f0)]
        avg_pitch = float(np.mean(f0_valid)) if len(f0_valid) > 0 else 0.0

        # Chroma (chord estimation)
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        dominant_note_idx = int(np.argmax(np.mean(chroma, axis=1)))
        notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
        dominant_note = notes[dominant_note_idx]

        # Simulate accuracy score
        pitch_accuracy = min(100.0, max(0.0, 100 - abs(avg_pitch - 220) / 2))
        rhythm_accuracy = min(100.0, float(tempo) / 1.2)
        overall = (pitch_accuracy + rhythm_accuracy) / 2

        return {
            "tempo_bpm": float(tempo),
            "avg_pitch_hz": round(avg_pitch, 2),
            "dominant_note": dominant_note,
            "pitch_accuracy": round(pitch_accuracy, 2),
            "rhythm_accuracy": round(rhythm_accuracy, 2),
            "overall_accuracy": round(overall, 2),
            "detected_notes": [dominant_note],
            "strengths": ["Buen tempo" if rhythm_accuracy > 70 else ""],
            "weaknesses": ["Mejorar afinación" if pitch_accuracy < 60 else ""],
        }
    except Exception as e:
        return {"error": str(e), "overall_accuracy": 0}


def generate_recommendations(user, analysis: AIAnalysis) -> list:
    """HU-011: Generate personalized recommendations based on weaknesses."""
    from apps.lessons.models import Lesson
    recs = []
    if analysis.pitch_accuracy and analysis.pitch_accuracy < 60:
        lessons = Lesson.objects.filter(
            lesson_type="practice", is_active=True,
            level=user.initial_level or "beginner"
        )[:3]
        for lesson in lessons:
            rec = UserRecommendation.objects.create(
                user=user, lesson=lesson,
                reason="Tu afinación necesita práctica. Esta lección puede ayudarte.",
                priority=1
            )
            recs.append(rec)
    return recs


class AudioAnalysisView(APIView):
    """HU-009, HU-010: Submit audio for real-time AI analysis using librosa."""
    def post(self, request):
        audio_file = request.FILES.get("audio")
        exercise_id = request.data.get("exercise_id")

        if not audio_file:
            return Response({"detail": "No se recibió archivo de audio."}, status=400)

        start_time = time.time()
        path = default_storage.save(f"ai/audio/{audio_file.name}", audio_file)
        full_path = default_storage.path(path)

        result = analyze_audio_with_librosa(full_path)
        elapsed_ms = int((time.time() - start_time) * 1000)

        exercise = None
        if exercise_id:
            from apps.exercises.models import Exercise
            exercise = Exercise.objects.filter(id=exercise_id).first()

        analysis = AIAnalysis.objects.create(
            user=request.user,
            analysis_type="audio",
            exercise=exercise,
            audio_file=path,
            accuracy_score=result.get("overall_accuracy"),
            pitch_accuracy=result.get("pitch_accuracy"),
            rhythm_accuracy=result.get("rhythm_accuracy"),
            detected_notes=result.get("detected_notes", []),
            strengths=[s for s in result.get("strengths",[]) if s],
            weaknesses=[w for w in result.get("weaknesses",[]) if w],
            feedback_text=f"Precisión general: {result.get('overall_accuracy',0):.1f}%",
            raw_result=result,
            processing_time_ms=elapsed_ms,
        )

        # XP for submitting audio
        request.user.add_xp(10)

        return Response(AIAnalysisSerializer(analysis).data)


class PerformanceAnalysisView(APIView):
    """HU-011: Analyze user performance and return AI recommendations."""
    def post(self, request):
        from apps.exercises.models import ExerciseAttempt
        recent_attempts = ExerciseAttempt.objects.filter(
            user=request.user
        ).order_by("-attempted_at")[:20]

        if not recent_attempts.exists():
            return Response({"detail": "No hay suficientes datos para analizar."}, status=400)

        total = recent_attempts.count()
        correct = recent_attempts.filter(is_correct=True).count()
        accuracy = round((correct / total) * 100, 2)

        analysis = AIAnalysis.objects.create(
            user=request.user,
            analysis_type="performance",
            accuracy_score=accuracy,
            feedback_text=f"Has respondido correctamente el {accuracy}% de los ejercicios recientes.",
            strengths=["Constancia en la práctica"] if total >= 10 else [],
            weaknesses=["Aumentar la frecuencia de práctica"] if total < 10 else [],
            recommendations=_get_ai_recs(accuracy),
        )
        return Response(AIAnalysisSerializer(analysis).data)


class RecommendationsView(APIView):
    """HU-011: Get personalized AI recommendations."""
    def get(self, request):
        recs = UserRecommendation.objects.filter(user=request.user, is_seen=False)[:10]
        return Response(RecommendationSerializer(recs, many=True).data)


class PersonalizedLessonsView(APIView):
    """
    HU-011 / HU-013: Lecciones personalizadas con Claude AI.
    GET /api/ai/personalized-lessons/
    Analiza el perfil del usuario y retorna lecciones recomendadas
    con una explicación personalizada generada por Claude.
    """

    def get(self, request):
        from django.conf import settings
        from apps.lessons.models import Lesson, UserLesson
        from apps.exercises.models import ExerciseAttempt
        from apps.progress.models import ProgressRecord

        user = request.user

        if not settings.ANTHROPIC_API_KEY:
            return Response(
                {"detail": "ANTHROPIC_API_KEY no configurada en el servidor."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # ── 1. Perfil del usuario ────────────────────────────
        instrument_name = user.instrument.name if user.instrument else None
        instrument_slug = user.instrument.slug if user.instrument else None

        completed_ids = list(
            UserLesson.objects.filter(user=user, completed=True)
            .values_list("lesson_id", flat=True)
        )

        # ── 2. Precisión por tipo de ejercicio ───────────────
        attempts = ExerciseAttempt.objects.filter(user=user)
        accuracy_by_type = {}
        for ex_type in ["note_recognition", "rhythm", "chord", "pitch", "ear_training"]:
            type_attempts = attempts.filter(exercise__exercise_type=ex_type)
            total = type_attempts.count()
            if total > 0:
                correct = type_attempts.filter(is_correct=True).count()
                accuracy_by_type[ex_type] = round((correct / total) * 100, 1)

        # ── 3. Lecciones candidatas (no completadas, activas) ─
        lessons_qs = Lesson.objects.filter(is_active=True).exclude(id__in=completed_ids)
        if instrument_slug:
            lessons_qs = lessons_qs.filter(instrument__slug=instrument_slug)
        if not user.is_premium:
            lessons_qs = lessons_qs.filter(is_premium=False)

        candidate_lessons = list(
            lessons_qs.select_related("instrument").values(
                "id", "title", "description", "level",
                "lesson_type", "xp_reward", "duration_minutes",
                "instrument__name",
            )[:20]
        )

        if not candidate_lessons:
            return Response({
                "message": "No hay lecciones disponibles para tu perfil en este momento.",
                "lessons": [],
            })

        # ── 4. Progreso reciente ─────────────────────────────
        recent_progress = list(
            ProgressRecord.objects.filter(user=user)
            .order_by("-date")
            .values("date", "lessons_completed", "exercises_done", "accuracy_avg", "xp_earned")[:7]
        )
        for rec in recent_progress:
            rec["date"] = str(rec["date"])

        # ── 5. Construir prompt para Claude ──────────────────
        user_profile = {
            "nombre": user.name,
            "nivel_xp": user.level,
            "xp_actual": user.xp,
            "nivel_inicial": user.initial_level or "beginner",
            "instrumento": instrument_name or "Sin instrumento",
            "racha_dias": user.streak,
            "lecciones_completadas": len(completed_ids),
            "precision_por_tipo": accuracy_by_type,
            "progreso_ultima_semana": recent_progress,
        }

        system_prompt = """Eres un tutor musical inteligente de MelodyPath, una plataforma de aprendizaje musical gamificada.
Tu tarea es analizar el perfil de un estudiante y recomendar las mejores lecciones disponibles para él,
con una explicación personalizada y motivadora para cada una.

REGLAS:
- Selecciona entre 3 y 5 lecciones de la lista de candidatas.
- Prioriza lecciones que correspondan al nivel del estudiante y sus áreas débiles.
- La explicación debe ser cálida, motivadora y en español.
- Menciona específicamente por qué ESA lección le sirve a ESE estudiante.
- Responde ÚNICAMENTE con JSON válido, sin texto adicional, con esta estructura exacta:
{
  "mensaje_general": "string — saludo personalizado y motivación general (2-3 oraciones)",
  "lecciones": [
    {
      "id": <número entero>,
      "explicacion": "string — por qué esta lección es ideal para el estudiante (1-2 oraciones)"
    }
  ]
}"""

        user_message = f"""Perfil del estudiante:
{user_profile}

Lecciones candidatas disponibles:
{candidate_lessons}

Recomienda las mejores lecciones para este estudiante."""

        # ── 6. Llamar a Claude API ───────────────────────────
        try:
            import anthropic

            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

            ai_response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}],
            )

            import json
            raw_text = ai_response.content[0].text.strip()
            ai_data = json.loads(raw_text)

        except json.JSONDecodeError:
            return Response(
                {"detail": "Error al procesar la respuesta de IA. Intenta de nuevo."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as e:
            return Response(
                {"detail": f"Error al conectar con la IA: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # ── 7. Enriquecer con datos completos de la lección ──
        recommended_ids = [item["id"] for item in ai_data.get("lecciones", [])]
        explanations = {item["id"]: item["explicacion"] for item in ai_data.get("lecciones", [])}

        lessons_map = {
            l["id"]: l for l in candidate_lessons if l["id"] in recommended_ids
        }

        result_lessons = []
        for lesson_id in recommended_ids:
            if lesson_id not in lessons_map:
                continue
            lesson = lessons_map[lesson_id]
            result_lessons.append({
                "id": lesson["id"],
                "title": lesson["title"],
                "description": lesson["description"],
                "level": lesson["level"],
                "lesson_type": lesson["lesson_type"],
                "xp_reward": lesson["xp_reward"],
                "duration_minutes": lesson["duration_minutes"],
                "instrument": lesson["instrument__name"],
                "ai_explanation": explanations.get(lesson_id, ""),
            })

        # ── 8. Guardar recomendaciones en BD ─────────────────
        lesson_objs = Lesson.objects.filter(id__in=recommended_ids)
        lesson_obj_map = {l.id: l for l in lesson_objs}
        for lesson_id in recommended_ids:
            if lesson_id in lesson_obj_map:
                UserRecommendation.objects.get_or_create(
                    user=user,
                    lesson=lesson_obj_map[lesson_id],
                    defaults={
                        "reason": explanations.get(lesson_id, "Recomendado por IA"),
                        "priority": recommended_ids.index(lesson_id) + 1,
                    },
                )

        return Response({
            "mensaje_general": ai_data.get("mensaje_general", ""),
            "lecciones": result_lessons,
            "tokens_usados": ai_response.usage.input_tokens + ai_response.usage.output_tokens,
        })


def _get_ai_recs(accuracy: float) -> list:
    if accuracy >= 80:
        return ["Estás listo para el siguiente nivel", "Intenta ejercicios avanzados"]
    elif accuracy >= 50:
        return ["Practica ejercicios de ritmo", "Repasa la teoría musical básica"]
    return ["Repasa las lecciones del nivel principiante", "Practica 10 minutos diarios"]
