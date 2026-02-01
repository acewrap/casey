from rest_framework import serializers
from .models import Event, Incident
from artifacts.models import Indicator
from core.models import User

class IndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Indicator
        fields = ['value', 'indicator_type']

class EventSerializer(serializers.ModelSerializer):
    indicators = IndicatorSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class IncidentSerializer(serializers.ModelSerializer):
    events = EventSerializer(many=True, read_only=True)
    event_ids = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        many=True,
        write_only=True,
        source='events'
    )
    owner_email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Incident
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'onspring_id', 'onspring_url')

    def create(self, validated_data):
        owner_email = validated_data.pop('owner_email', None)
        if owner_email:
            try:
                owner = User.objects.get(email=owner_email)
                validated_data['owner'] = owner
            except User.DoesNotExist:
                pass
        return super().create(validated_data)
