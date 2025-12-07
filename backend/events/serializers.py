from rest_framework import serializers
from .models import Event, Registration, DistributionGroup, AccessRequest, GroupAccessRequest
from users.models import User
from rest_framework import exceptions

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']


class ForSelectUserSerializer(serializers.ModelSerializer):
    """Minimal serializer for populating selects in the frontend — does not expose emails."""
    class Meta:
        model = User
        fields = ['id', 'username']

class EventSerializer(serializers.ModelSerializer):
    admins = UserSerializer(many=True, read_only=True)
    group = serializers.PrimaryKeyRelatedField(queryset=DistributionGroup.objects.all(), allow_null=True, required=False)
    group_name = serializers.CharField(source='group.name', read_only=True, allow_null=True)

    class Meta:
        model = Event
        fields = ['id','name','description','date','location','capacity','max_qr_codes','admins','group','group_name','requires_approval']

class RegistrationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    qr_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Registration
        fields = ['id','user','event','entry_code','qr_code','qr_url','used']
        read_only_fields = ['entry_code','qr_code','qr_url']

    def get_qr_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code and hasattr(obj.qr_code, 'url'):
            return request.build_absolute_uri(obj.qr_code.url) if request else obj.qr_code.url
        return None

    def create(self, validated_data):
        # associate the registration with the request user if available
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
        else:
            user = validated_data.get('user')
        registration = Registration(user=user, **{k: v for k, v in validated_data.items() if k != 'user'})
        registration.save()
        return registration


from .models import DistributionGroup, Event


class DistributionGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistributionGroup
        fields = ['id', 'name', 'members', 'events', 'admins', 'creators']
    
    def to_representation(self, instance):
        # For GET: return lists of IDs
        ret = super().to_representation(instance)
        ret['members'] = list(instance.members.values_list('id', flat=True))
        ret['admins'] = list(instance.admins.values_list('id', flat=True))
        ret['creators'] = list(instance.creators.values_list('id', flat=True))
        ret['events'] = list(instance.events.values_list('id', flat=True))
        return ret

    def create(self, validated_data):
        members_in = validated_data.pop('members', [])
        admins_in = validated_data.pop('admins', [])
        creators_in = validated_data.pop('creators', [])
        events_in = validated_data.pop('events', [])

        group = DistributionGroup.objects.create(name=validated_data.get('name', ''))

        # Members/admins/creators: accept list of user IDs
        if members_in:
            group.members.set(members_in)
        if admins_in:
            group.admins.set(admins_in)
        if creators_in:
            group.creators.set(creators_in)

        # Events: accept list of event IDs
        if events_in:
            group.events.set(events_in)

        return group

    def update(self, instance, validated_data):
        members_in = validated_data.pop('members', None)
        admins_in = validated_data.pop('admins', None)
        creators_in = validated_data.pop('creators', None)
        events_in = validated_data.pop('events', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if members_in is not None:
            instance.members.set(members_in)
        if admins_in is not None:
            instance.admins.set(admins_in)
        if creators_in is not None:
            instance.creators.set(creators_in)
        if events_in is not None:
            instance.events.set(events_in)

        return instance


from .models import GroupAccessToken

class GroupAccessTokenSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    group = serializers.PrimaryKeyRelatedField(queryset=DistributionGroup.objects.all())
    qr_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = GroupAccessToken
        fields = ['id','group','user','token','qr_code','qr_url','active','created_at','usage_count']
        read_only_fields = ['token','qr_code','qr_url','created_at','usage_count']

    def get_qr_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code and hasattr(obj.qr_code, 'url'):
            return request.build_absolute_uri(obj.qr_code.url) if request else obj.qr_code.url
        return None

    def create(self, validated_data):
        token = GroupAccessToken.objects.create(**validated_data)
        return token


class AccessRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    event_id = serializers.IntegerField(source='event.id', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = AccessRequest
        fields = ['id', 'user', 'event_id', 'event_name', 'status', 'message', 'requested_at', 'reviewed_at', 'reviewed_by', 'admin_notes']
        read_only_fields = ['status', 'requested_at', 'reviewed_at', 'reviewed_by', 'admin_notes']


class GroupAccessRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    group_id = serializers.IntegerField(source='group.id', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    
    class Meta:
        from .models import GroupAccessRequest
        model = GroupAccessRequest
        fields = ['id', 'user', 'group_id', 'group_name', 'status', 'message', 'requested_at', 'reviewed_at', 'reviewed_by', 'admin_notes']
        read_only_fields = ['status', 'requested_at', 'reviewed_at', 'reviewed_by', 'admin_notes']


