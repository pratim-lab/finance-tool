from rest_framework import serializers
from django.utils import dateformat
from tools.models import Client, Project, Invoice

class InvoiceClientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Client
        fields = [
            'id',
            'client_name'
        ]

class InvoiceProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = [
            'id',
            'project_name'
        ]


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


class InvoiceAddSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Invoice
        fields = [
            'id',
            'client',
            'project',
            'invoice_date',
            'invoice_number',
            'invoice_status',
            'expected_date_of_payment',
            'invoice_amount',
        ]


class InvoiceRetrieveSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    client = InvoiceClientSerializer()
    project = InvoiceProjectSerializer()
    created_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        return dateformat.format(obj.created_at, 'N j, Y, ') + dateformat.time_format(obj.created_at, 'g:i a')

    class Meta:
        model = Invoice
        fields = [
            'id',
            'client',
            'project',
            'invoice_date',
            'invoice_number',
            'invoice_status',
            'expected_date_of_payment',
            'invoice_amount',
            'created_at'
        ]


class ListInvoiceRetrieveSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    client = InvoiceClientSerializer()
    project = InvoiceProjectSerializer()
    invoice_status = ChoiceField(choices=Invoice.INVOICE_STATUS)
    
    class Meta:
        model = Invoice
        fields = [
            'id',
            'client',
            'project',
            'invoice_date',
            'invoice_number',
            'invoice_status',
            'expected_date_of_payment',
            'invoice_amount',
        ]
