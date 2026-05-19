"""
Actualiza los video_url de las lecciones existentes en la BD.
Ejecutar con: python update_video_urls.py
"""
import django, os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "melodypath.settings")
django.setup()

from apps.lessons.models import Lesson

VIDEO_MAP = {
    "Las notas musicales":            "https://www.youtube.com/watch?v=Y2V-gBcMkKY",
    "El ritmo y el compás":           "https://www.youtube.com/watch?v=mvuAHFdHoKQ",
    "Postura y posición en el piano": "https://www.youtube.com/watch?v=Cj-NKH1i-Gs",
    "Partes de la guitarra":          "https://www.youtube.com/watch?v=hFCNdAHAQNw",
    "Tu primer acorde: La Mayor":     "https://www.youtube.com/watch?v=RRf1hG5juzc",
    "Coordinación básica de batería": "https://www.youtube.com/watch?v=AgHJcj-Gvs0",
    "Escalas mayores y menores":      "https://www.youtube.com/watch?v=4jT-3jAPkBg",
}

updated = 0
for title, url in VIDEO_MAP.items():
    count = Lesson.objects.filter(title=title).update(video_url=url)
    status = "✓" if count else "✗ (no encontrada)"
    print(f"  {status} {title}")
    updated += count

print(f"\n✅ {updated} lecciones actualizadas con video_url.")
print(f"   Total lecciones en BD: {Lesson.objects.count()}")
print(f"   Con video: {Lesson.objects.exclude(video_url='').count()}")
