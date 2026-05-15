from rest_framework import serializers
from .models import Instrument


class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = ["id", "name", "slug", "emoji", "category", "description", "image", "is_active", "order"]
