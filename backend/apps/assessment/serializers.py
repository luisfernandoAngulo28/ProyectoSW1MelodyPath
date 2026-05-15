from rest_framework import serializers
from .models import AssessmentQuestion, UserAssessment, ModuleEvaluation


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = ["id", "question", "category", "options", "order"]
        # correct_answer excluded for security


class UserAssessmentSerializer(serializers.ModelSerializer):
    assigned_level_display = serializers.CharField(source="get_assigned_level_display", read_only=True)

    class Meta:
        model = UserAssessment
        fields = ["id", "score", "assigned_level", "assigned_level_display", "completed_at"]


class SubmitAssessmentSerializer(serializers.Serializer):
    answers = serializers.ListField(child=serializers.DictField())


class ModuleEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleEvaluation
        fields = ["id", "lesson", "score", "passed", "feedback", "completed_at"]
