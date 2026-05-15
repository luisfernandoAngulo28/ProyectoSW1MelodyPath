from rest_framework import serializers
from .models import Exercise, ExerciseAttempt


class ExerciseSerializer(serializers.ModelSerializer):
    instrument_name = serializers.CharField(source="instrument.name", read_only=True)

    class Meta:
        model = Exercise
        fields = [
            "id", "title", "exercise_type", "difficulty", "instrument",
            "instrument_name", "lesson", "question", "options",
            "xp_reward", "audio_file", "image", "is_active",
        ]
        # correct_answer is excluded from read for security


class ExerciseSubmitSerializer(serializers.Serializer):
    answer = serializers.CharField()


class ExerciseAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseAttempt
        fields = ["id", "exercise", "user_answer", "is_correct", "response_time_ms", "feedback", "attempted_at"]
        read_only_fields = ["is_correct", "feedback", "attempted_at"]
