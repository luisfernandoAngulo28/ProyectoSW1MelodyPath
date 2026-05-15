from django.db import models
from django.conf import settings


class AssessmentQuestion(models.Model):
    """Questions used in the initial diagnostic assessment (HU-003)."""
    CATEGORY_CHOICES = [
        ("theory", "Teoría musical"),
        ("rhythm", "Ritmo"),
        ("notes", "Notas"),
        ("instruments", "Instrumentos"),
    ]
    question = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    options = models.JSONField(default=list)
    correct_answer = models.CharField(max_length=200)
    level_indicator = models.CharField(max_length=15,
        choices=[("beginner","Principiante"),("intermediate","Intermedio"),("advanced","Avanzado")])
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Pregunta de evaluación"
        ordering = ["order"]

    def __str__(self):
        return f"[{self.category}] {self.question[:60]}..."


class UserAssessment(models.Model):
    """Stores the result of a user's initial assessment (HU-003, HU-004)."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assessment"
    )
    answers = models.JSONField(default=dict)
    score = models.FloatField()
    assigned_level = models.CharField(max_length=15,
        choices=[("beginner","Principiante"),("intermediate","Intermedio"),("advanced","Avanzado")])
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Evaluación inicial"

    def __str__(self):
        return f"{self.user} — {self.get_assigned_level_display()} ({self.score:.0f}%)"


class ModuleEvaluation(models.Model):
    """Per-module evaluation results (HU-012)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="module_evaluations")
    lesson = models.ForeignKey("lessons.Lesson", on_delete=models.CASCADE, related_name="evaluations")
    score = models.FloatField()
    passed = models.BooleanField()
    answers = models.JSONField(default=dict)
    feedback = models.TextField(blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Evaluación de módulo"
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.user} — {self.lesson} {self.score:.0f}% ({'✓' if self.passed else '✗'})"
