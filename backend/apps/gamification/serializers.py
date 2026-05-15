from rest_framework import serializers
from .models import Badge, UserBadge, Challenge, UserChallenge


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ["id", "slug", "name", "description", "icon", "xp_required"]


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = ["id", "badge", "earned_at"]


class ChallengeSerializer(serializers.ModelSerializer):
    frequency_display = serializers.CharField(source="get_frequency_display", read_only=True)

    class Meta:
        model = Challenge
        fields = [
            "id", "title", "description", "frequency", "frequency_display",
            "xp_reward", "target_count", "action_type", "instrument",
        ]


class UserChallengeSerializer(serializers.ModelSerializer):
    challenge = ChallengeSerializer(read_only=True)

    class Meta:
        model = UserChallenge
        fields = ["id", "challenge", "progress", "completed", "completed_at", "period_start"]


class RankingSerializer(serializers.Serializer):
    position = serializers.IntegerField()
    user_id = serializers.IntegerField()
    name = serializers.CharField()
    level = serializers.IntegerField()
    xp = serializers.IntegerField()
    streak = serializers.IntegerField()
    instrument = serializers.CharField(allow_null=True)
    is_current_user = serializers.BooleanField()
