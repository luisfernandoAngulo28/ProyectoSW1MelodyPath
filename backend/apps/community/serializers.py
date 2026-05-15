from rest_framework import serializers
from .models import Community, CommunityMember, SharedAchievement


class CommunitySerializer(serializers.ModelSerializer):
    instrument_name = serializers.CharField(source="instrument.name", read_only=True, allow_null=True)

    class Meta:
        model = Community
        fields = ["id", "name", "description", "instrument", "instrument_name",
                  "icon", "external_url", "member_count", "is_active", "created_at"]


class SharedAchievementSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    badge_icon = serializers.CharField(source="badge.icon", read_only=True, allow_null=True)
    badge_name = serializers.CharField(source="badge.name", read_only=True, allow_null=True)

    class Meta:
        model = SharedAchievement
        fields = ["id", "user_name", "badge_icon", "badge_name", "message", "likes", "created_at"]
