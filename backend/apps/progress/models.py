from django.db import models
from django.conf import settings


class ProgressRecord(models.Model):
    """Daily progress snapshot per user (HU-016)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="progress_records")
    date = models.DateField()
    lessons_completed = models.PositiveIntegerField(default=0)
    exercises_done = models.PositiveIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=0)
    accuracy_avg = models.FloatField(null=True, blank=True)
    practice_minutes = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["user", "date"]
        verbose_name = "Registro de progreso"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user} — {self.date} ({self.xp_earned} XP)"


class PracticeReminder(models.Model):
    """Practice reminders for users (HU-017)."""
    DAYS_CHOICES = [(0,"Lunes"),(1,"Martes"),(2,"Miércoles"),(3,"Jueves"),(4,"Viernes"),(5,"Sábado"),(6,"Domingo")]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reminders")
    time = models.TimeField()
    days = models.JSONField(default=list, help_text="Lista de días (0=Lunes...6=Domingo)")
    message = models.CharField(max_length=200, default="¡Es hora de practicar! 🎵")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Recordatorio"

    def __str__(self):
        return f"Recordatorio {self.user} — {self.time}"
