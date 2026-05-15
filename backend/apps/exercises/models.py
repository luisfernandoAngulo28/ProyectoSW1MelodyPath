from django.db import models
from django.conf import settings


class Exercise(models.Model):
    TYPE_CHOICES = [
        ("note_recognition", "Reconocimiento de notas"),
        ("rhythm", "Ritmo"),
        ("chord", "Acordes"),
        ("pitch", "Afinación"),
        ("sight_reading", "Lectura musical"),
        ("ear_training", "Entrenamiento auditivo"),
    ]
    DIFFICULTY_CHOICES = [
        ("easy", "Fácil"),
        ("medium", "Medio"),
        ("hard", "Difícil"),
    ]

    title = models.CharField(max_length=200)
    exercise_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="easy")
    instrument = models.ForeignKey(
        "instruments.Instrument", on_delete=models.CASCADE,
        related_name="exercises", null=True, blank=True
    )
    lesson = models.ForeignKey(
        "lessons.Lesson", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="exercises"
    )
    question = models.TextField()
    options = models.JSONField(default=list, blank=True,
        help_text="Lista de opciones para ejercicios de selección múltiple")
    correct_answer = models.CharField(max_length=200)
    explanation = models.TextField(blank=True)
    xp_reward = models.PositiveIntegerField(default=25)
    audio_file = models.FileField(upload_to="exercises/audio/", null=True, blank=True)
    image = models.ImageField(upload_to="exercises/images/", null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Ejercicio"
        verbose_name_plural = "Ejercicios"
        ordering = ["difficulty", "exercise_type"]

    def __str__(self):
        return f"[{self.get_exercise_type_display()}] {self.title}"


class ExerciseAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="exercise_attempts")
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name="attempts")
    user_answer = models.CharField(max_length=200)
    is_correct = models.BooleanField()
    response_time_ms = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Intento de ejercicio"
        ordering = ["-attempted_at"]

    def __str__(self):
        return f"{self.user} → {self.exercise} ({'✓' if self.is_correct else '✗'})"
