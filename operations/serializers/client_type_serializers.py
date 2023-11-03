from rest_framework import serializers

from tools.models import ClientType


class ClientTypeAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = ClientType
        fields = [
            'id',
            'name'
        ]


class ClientTypeRetrieveSerializer(serializers.ModelSerializer):

    class Meta:
        model = ClientType
        fields = [
            'id',
            'name'
        ]
