from django.db import models
from django.conf import settings


class Community(models.Model):
    """Learning communities (HU-019, HU-026)."""
    name = models.CharField(max_length=150)
    description = models.TextField()
    instrument = models.ForeignKey(
        "instruments.Instrument", null=True, blank=True, on_delete=models.SET_NULL
    )
    icon = models.CharField(max_length=10, default="👥")
    external_url = models.URLField(blank=True, help_text="Enlace a WhatsApp, Discord u otra plataforma")
    member_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Comunidad"
        verbose_name_plural = "Comunidades"
        ordering = ["-member_count"]

    def __str__(self):
        return f"{self.icon} {self.name}"


class CommunityMember(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="communities")
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="members")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "community"]
        verbose_name = "Miembro de comunidad"

    def __str__(self):
        return f"{self.user} ∈ {self.community}"


class SharedAchievement(models.Model):
    """User shares a badge or milestone (HU-018)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shared_achievements")
    badge = models.ForeignKey("gamification.Badge", null=True, blank=True, on_delete=models.SET_NULL)
    message = models.TextField()
    likes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Logro compartido"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} compartió: {self.message[:60]}"
