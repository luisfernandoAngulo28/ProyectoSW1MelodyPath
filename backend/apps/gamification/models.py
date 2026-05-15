from django.db import models
from django.conf import settings


class Badge(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=10, default="🏅")
    xp_required = models.PositiveIntegerField(default=0)
    condition = models.CharField(max_length=50, blank=True,
        help_text="Código de condición para otorgamiento automático")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Insignia"
        ordering = ["name"]

    def __str__(self):
        return f"{self.icon} {self.name}"


class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_badges")
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name="user_badges")
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "badge"]
        verbose_name = "Insignia de usuario"

    def __str__(self):
        return f"{self.user} — {self.badge}"


class Challenge(models.Model):
    FREQUENCY_CHOICES = [("daily", "Diario"), ("weekly", "Semanal")]

    title = models.CharField(max_length=200)
    description = models.TextField()
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    xp_reward = models.PositiveIntegerField(default=100)
    badge = models.ForeignKey(Badge, null=True, blank=True, on_delete=models.SET_NULL)
    target_count = models.PositiveIntegerField(default=1,
        help_text="Cuántas veces debe completarse la acción")
    action_type = models.CharField(max_length=50, default="complete_lesson")
    instrument = models.ForeignKey(
        "instruments.Instrument", null=True, blank=True, on_delete=models.SET_NULL
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reto"
        verbose_name_plural = "Retos"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.get_frequency_display()}] {self.title}"


class UserChallenge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_challenges")
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name="user_challenges")
    progress = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    period_start = models.DateField()

    class Meta:
        unique_together = ["user", "challenge", "period_start"]
        verbose_name = "Reto de usuario"

    def __str__(self):
        return f"{self.user} — {self.challenge} ({self.progress}/{self.challenge.target_count})"


class Ranking(models.Model):
    """Weekly snapshot of the leaderboard (HU-020)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="rankings")
    week_start = models.DateField()
    xp_earned = models.PositiveIntegerField(default=0)
    position = models.PositiveIntegerField(default=0)
    lessons_completed = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["user", "week_start"]
        verbose_name = "Ranking"
        ordering = ["week_start", "position"]

    def __str__(self):
        return f"#{self.position} {self.user} — semana {self.week_start}"
