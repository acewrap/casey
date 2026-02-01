from rest_framework import serializers
from .models import Event, Incident, Investigation, ChartDefinition
from artifacts.models import Indicator
from core.models import User, AuditLog

class IndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Indicator
        fields = ['id', 'value', 'indicator_type'] # Added ID for reference

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

class InvestigationSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    indicators = IndicatorSerializer(many=True, read_only=True)
    related_events = EventSerializer(many=True, read_only=True)

    class Meta:
        model = Investigation
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'event')

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'

class ChartDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartDefinition
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'user')
