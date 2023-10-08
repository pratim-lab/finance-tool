from rest_framework import serializers

from operations.models import Pipeline
from tools.models import Client, Project


class PipelineClientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Client
        fields = [
            'id',
            'client_name'
        ]


class PipelineProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = [
            'id',
            'project_name'
        ]


class PipelineAddSerializer(serializers.ModelSerializer):

    class Meta:
        model = Pipeline
        fields = [
            'client',
            'project',
            'estimated_price',
            'confidence',
            'no_of_payments',
            'expected_date_of_first_payment',
            'expected_date_of_second_payment',
            'expected_date_of_third_payment',
            'expected_date_of_forth_payment',
            'expected_date_of_fifth_payment',
            'expected_date_of_sixth_payment',
            'expected_date_of_seventh_payment',
            'expected_date_of_eighth_payment',
            'expected_date_of_nineth_payment',
            'expected_date_of_tenth_payment',
            'expected_date_of_eleventh_payment',
            'expected_date_of_twelfth_payment',
            'total_value_in_forecast',
            'estimated_payment_amount'
        ]


class ListPipelineRetrieveSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    client = PipelineClientSerializer()
    project = PipelineProjectSerializer()

    class Meta:
        model = Pipeline
        fields = [
            'id',
            'client',
            'project',
            'estimated_price',
            'confidence',
            'no_of_payments',
            'expected_date_of_first_payment',
            'expected_date_of_second_payment',
            'expected_date_of_third_payment',
            'expected_date_of_forth_payment',
            'expected_date_of_fifth_payment',
            'expected_date_of_sixth_payment',
            'expected_date_of_seventh_payment',
            'expected_date_of_eighth_payment',
            'expected_date_of_nineth_payment',
            'expected_date_of_tenth_payment',
            'expected_date_of_eleventh_payment',
            'expected_date_of_twelfth_payment',
            'total_value_in_forecast',
            'estimated_payment_amount'
        ]
