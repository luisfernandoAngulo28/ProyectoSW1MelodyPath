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


def _get_ai_recs(accuracy: float) -> list:
    if accuracy >= 80:
        return ["Estás listo para el siguiente nivel", "Intenta ejercicios avanzados"]
    elif accuracy >= 50:
        return ["Practica ejercicios de ritmo", "Repasa la teoría musical básica"]
    return ["Repasa las lecciones del nivel principiante", "Practica 10 minutos diarios"]
