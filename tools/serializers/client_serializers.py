from rest_framework import serializers
from django.utils import dateformat
from tools.models import Client


class ChoiceField(serializers.ChoiceField):

    def to_representation(self, obj):
        if obj == '' and self.allow_blank:
            return obj
        return self._choices[obj]

    # def to_internal_value(self, data):
    #     # To support inserts with the value
    #     if data == '' and self.allow_blank:
    #         return ''
    #
    #     for key, val in self._choices.items():
    #         if val == data:
    #             return key
    #     self.fail('invalid_choice', input=data)


class ClientAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    client_type = ChoiceField(choices=Client.CLIENT_TYPES)
    billing_structure = ChoiceField(choices=Client.BILLING_STRUCTURE)
    payment_terms = ChoiceField(choices=Client.PAYMENT_TERMS)
    # created_at = serializers.DateTimeField(read_only=True, format='%b %d, %Y, %I:%M %p')
    created_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        return dateformat.format(obj.created_at, 'N j, Y, ') + dateformat.time_format(obj.created_at, 'g:i a')

    class Meta:
        model = Client
        fields = [
            'id',
            'client_name',
            'address1',
            'address2',
            'city',
            'state',
            'country',
            'zipcode',
            'client_type',
            'billing_structure',
            'billing_target',
            'payment_terms',
            'created_at'
        ]


class ClientRetrieveSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        return dateformat.format(obj.created_at, 'N j, Y') + dateformat.time_format(obj.created_at, 'g:i a')

    class Meta:
        model = Client
        fields = [
            'id',
            'client_name',
            'address1',
            'address2',
            'city',
            'state',
            'country',
            'zipcode',
            'client_type',
            'billing_structure',
            'billing_target',
            'payment_terms',
            'created_at'
        ]
