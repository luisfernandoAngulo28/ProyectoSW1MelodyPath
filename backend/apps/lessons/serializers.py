from rest_framework import serializers
from .models import Lesson, UserLesson


class LessonSerializer(serializers.ModelSerializer):
    instrument_name = serializers.CharField(source="instrument.name", read_only=True)
    instrument_emoji = serializers.CharField(source="instrument.emoji", read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id", "title", "description", "instrument", "instrument_name",
            "instrument_emoji", "level", "lesson_type", "order", "content",
            "video_url", "xp_reward", "duration_minutes", "is_premium",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class UserLessonSerializer(serializers.ModelSerializer):
    lesson = LessonSerializer(read_only=True)

    class Meta:
        model = UserLesson
        fields = ["id", "lesson", "completed", "score", "completed_at", "attempts"]
