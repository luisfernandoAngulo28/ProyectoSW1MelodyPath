from django.db import models


class Instrument(models.Model):
    CATEGORY_CHOICES = [
        ("string", "Cuerda"),
        ("percussion", "Percusión"),
        ("wind", "Viento"),
        ("voice", "Voz"),
        ("keyboard", "Teclado"),
    ]
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    emoji = models.CharField(max_length=10, default="🎵")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="instruments/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Instrumento"
        verbose_name_plural = "Instrumentos"
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.emoji} {self.name}"
