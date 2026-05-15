from rest_framework import serializers
from .models import AIAnalysis, UserRecommendation


class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = [
            "id", "analysis_type", "accuracy_score", "pitch_accuracy",
            "rhythm_accuracy", "detected_notes", "strengths", "weaknesses",
            "recommendations", "feedback_text", "processing_time_ms", "analyzed_at",
        ]


class RecommendationSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True, allow_null=True)
    exercise_title = serializers.CharField(source="exercise.title", read_only=True, allow_null=True)

    class Meta:
        model = UserRecommendation
        fields = ["id", "lesson", "lesson_title", "exercise", "exercise_title", "reason", "priority", "is_seen", "created_at"]
