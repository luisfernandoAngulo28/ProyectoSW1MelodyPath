from rest_framework import generics, permissions
from .models import Instrument
from .serializers import InstrumentSerializer


class InstrumentListView(generics.ListAPIView):
    """HU-005, HU-006: List all active instruments."""
    serializer_class = InstrumentSerializer
    queryset = Instrument.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]


class InstrumentDetailView(generics.RetrieveAPIView):
    serializer_class = InstrumentSerializer
    queryset = Instrument.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]


class InstrumentAdminView(generics.ListCreateAPIView):
    """HU-023: Admin create/list instruments."""
    serializer_class = InstrumentSerializer
    queryset = Instrument.objects.all()
    permission_classes = [permissions.IsAdminUser]


class InstrumentAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """HU-023: Admin update/delete instruments."""
    serializer_class = InstrumentSerializer
    queryset = Instrument.objects.all()
    permission_classes = [permissions.IsAdminUser]
