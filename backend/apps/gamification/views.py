from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from datetime import date, timedelta

from .models import Badge, UserBadge, Challenge, UserChallenge, Ranking
from .serializers import (
    BadgeSerializer, UserBadgeSerializer,
    ChallengeSerializer, UserChallengeSerializer, RankingSerializer
)


class BadgeListView(generics.ListAPIView):
    """HU-014: List all available badges."""
    serializer_class = BadgeSerializer
    queryset = Badge.objects.filter(is_active=True)


class UserBadgeListView(generics.ListAPIView):
    """HU-014: List badges earned by current user."""
    serializer_class = UserBadgeSerializer

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user).select_related("badge")


class ChallengeListView(generics.ListAPIView):
    """HU-015: List active daily/weekly challenges."""
    serializer_class = ChallengeSerializer

    def get_queryset(self):
        return Challenge.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        challenges = self.get_queryset()
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        result = []
        for ch in challenges:
            period = today if ch.frequency == "daily" else week_start
            user_ch, _ = UserChallenge.objects.get_or_create(
                user=request.user, challenge=ch, period_start=period,
                defaults={"progress": 0, "completed": False}
            )
            data = ChallengeSerializer(ch).data
            data["user_progress"] = user_ch.progress
            data["user_completed"] = user_ch.completed
            result.append(data)
        return Response(result)


class CompleteChallengeView(APIView):
    """HU-015: Mark a challenge step as done."""
    def post(self, request, pk):
        try:
            challenge = Challenge.objects.get(pk=pk, is_active=True)
        except Challenge.DoesNotExist:
            return Response({"detail": "Reto no encontrado."}, status=404)

        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        period = today if challenge.frequency == "daily" else week_start

        user_ch, _ = UserChallenge.objects.get_or_create(
            user=request.user, challenge=challenge, period_start=period
        )
        if user_ch.completed:
            return Response({"detail": "Ya completaste este reto.", "already_done": True})

        user_ch.progress += 1
        if user_ch.progress >= challenge.target_count:
            user_ch.completed = True
            user_ch.completed_at = timezone.now()
            request.user.add_xp(challenge.xp_reward)
            # Award badge if challenge has one
            if challenge.badge:
                UserBadge.objects.get_or_create(user=request.user, badge=challenge.badge)
            user_ch.save()
            return Response({
                "completed": True,
                "xp_earned": challenge.xp_reward,
                "message": f"¡Reto completado! +{challenge.xp_reward} XP",
            })
        user_ch.save()
        return Response({
            "completed": False,
            "progress": user_ch.progress,
            "target": challenge.target_count,
        })


class RankingView(APIView):
    """HU-020: Weekly leaderboard."""
    def get(self, request):
        today = date.today()
        week_start = today - timedelta(days=today.weekday())

        from apps.users.models import User
        users = User.objects.filter(is_active=True).order_by("-xp")[:20]
        result = []
        for i, u in enumerate(users, start=1):
            result.append({
                "position": i,
                "user_id": u.id,
                "name": u.name,
                "avatar_initial": u.avatar_initial,
                "level": u.level,
                "xp": u.xp,
                "streak": u.streak,
                "instrument": str(u.instrument) if u.instrument else None,
                "is_current_user": u.id == request.user.id,
            })
        return Response(result)
