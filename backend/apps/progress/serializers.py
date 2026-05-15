from rest_framework import serializers
from .models import ProgressRecord, PracticeReminder


class ProgressRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressRecord
        fields = ["id", "date", "lessons_completed", "exercises_done", "xp_earned", "accuracy_avg", "practice_minutes"]


class PracticeReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeReminder
        fields = ["id", "time", "days", "message", "is_active", "created_at"]
        read_only_fields = ["created_at"]
