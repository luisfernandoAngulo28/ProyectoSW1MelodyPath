from django.db import models
from django.conf import settings


class Lesson(models.Model):
    LEVEL_CHOICES = [
        ("beginner", "Principiante"),
        ("intermediate", "Intermedio"),
        ("advanced", "Avanzado"),
    ]
    TYPE_CHOICES = [
        ("theory", "Teoría"),
        ("practice", "Práctica"),
        ("tutorial", "Tutorial"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    instrument = models.ForeignKey(
        "instruments.Instrument", on_delete=models.CASCADE, related_name="lessons"
    )
    level = models.CharField(max_length=15, choices=LEVEL_CHOICES, default="beginner")
    lesson_type = models.CharField(max_length=15, choices=TYPE_CHOICES, default="theory")
    order = models.PositiveIntegerField(default=0)
    content = models.TextField(help_text="Contenido en Markdown")
    video_url = models.URLField(blank=True, help_text="URL de YouTube o Vimeo")
    xp_reward = models.PositiveIntegerField(default=50)
    duration_minutes = models.PositiveIntegerField(default=15)
    is_premium = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="created_lessons"
    )

    class Meta:
        verbose_name = "Lección"
        verbose_name_plural = "Lecciones"
        ordering = ["instrument", "level", "order"]

    def __str__(self):
        return f"[{self.get_level_display()}] {self.title}"


class UserLesson(models.Model):
    """Tracks which lessons a user has completed."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_lessons")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="user_lessons")
    completed = models.BooleanField(default=False)
    score = models.FloatField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["user", "lesson"]
        verbose_name = "Lección de usuario"

    def __str__(self):
        return f"{self.user} — {self.lesson}"
