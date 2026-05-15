from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .models import Community, CommunityMember, SharedAchievement
from .serializers import CommunitySerializer, SharedAchievementSerializer


class CommunityListView(generics.ListAPIView):
    """HU-019, HU-026: List active communities."""
    serializer_class = CommunitySerializer
    queryset = Community.objects.filter(is_active=True)


class CommunityDetailView(generics.RetrieveAPIView):
    serializer_class = CommunitySerializer
    queryset = Community.objects.filter(is_active=True)


class JoinCommunityView(APIView):
    """HU-019: Join a community."""
    def post(self, request, pk):
        try:
            community = Community.objects.get(pk=pk, is_active=True)
        except Community.DoesNotExist:
            return Response({"detail": "Comunidad no encontrada."}, status=404)
        _, created = CommunityMember.objects.get_or_create(user=request.user, community=community)
        if created:
            community.member_count += 1
            community.save(update_fields=["member_count"])
            return Response({"detail": f"Te uniste a {community.name} 🎉", "external_url": community.external_url})
        return Response({"detail": "Ya eres miembro de esta comunidad."})


class SharedAchievementListView(generics.ListAPIView):
    """HU-018: List shared achievements from the community."""
    serializer_class = SharedAchievementSerializer
    queryset = SharedAchievement.objects.all().order_by("-created_at")[:50]


class ShareAchievementView(APIView):
    """HU-018: Share a badge/achievement."""
    def post(self, request):
        from apps.gamification.models import Badge
        message = request.data.get("message", "")
        badge_id = request.data.get("badge_id")
        badge = Badge.objects.filter(id=badge_id).first() if badge_id else None
        shared = SharedAchievement.objects.create(
            user=request.user, badge=badge, message=message
        )
        return Response(SharedAchievementSerializer(shared).data, status=201)


class CommunityAdminView(generics.ListCreateAPIView):
    """HU-026: Admin manage communities."""
    serializer_class = CommunitySerializer
    queryset = Community.objects.all()
    permission_classes = [IsAdminUser]


class CommunityAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommunitySerializer
    queryset = Community.objects.all()
    permission_classes = [IsAdminUser]
