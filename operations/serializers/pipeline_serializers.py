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
    no_of_payments = serializers.IntegerField(required=True)

    def validate(self, data):
        validation_errors = {}
        if data['no_of_payments'] >= 2 and data['expected_date_of_second_payment'] is None:
            validation_errors['expected_date_of_second_payment'] = 'This field may not be null'
        if data['no_of_payments'] >= 3 and data['expected_date_of_third_payment'] is None:
            validation_errors['expected_date_of_third_payment'] = 'This field may not be null'
        if data['no_of_payments'] >= 4 and data['expected_date_of_forth_payment'] is None:
            validation_errors['expected_date_of_forth_payment'] = 'This field may not be null'
        if data['no_of_payments'] >= 5 and data['expected_date_of_fifth_payment'] is None:
            validation_errors['expected_date_of_fifth_payment'] = 'This field may not be null'
        if data['no_of_payments'] >= 6 and data['expected_date_of_sixth_payment'] is None:
            validation_errors['expected_date_of_sixth_payment'] = 'This field may not be null'
        if data['no_of_payments'] >= 7 and data['expected_date_of_seventh_payment'] is None:
            validation_errors['expected_date_of_seventh_payment'] = 'This field may not be null'
        if data['no_of_payments'] >= 8 and data['expected_date_of_eighth_payment'] is None:
            validation_errors['expected_date_of_eighth_payment'] = 'This field may not be null'
        if data['no_of_payments'] >= 9 and data['expected_date_of_nineth_payment'] is None:
            validation_errors['expected_date_of_nineth_payment'] = 'This field may not be null'
        if data['no_of_payments'] >= 10 and data['expected_date_of_tenth_payment'] is None:
            validation_errors['expected_date_of_tenth_payment'] = 'This field may not be null'
        if data['no_of_payments'] >= 11 and data['expected_date_of_eleventh_payment'] is None:
            validation_errors['expected_date_of_eleventh_payment'] = 'This field may not be null'
        if data['no_of_payments'] == 12 and data['expected_date_of_twelfth_payment'] is None:
            validation_errors['expected_date_of_twelfth_payment'] = 'This field may not be null'
        if len(validation_errors) > 0:
            raise serializers.ValidationError(validation_errors)
        return data

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
            'estimated_payment_amount',
            'note'
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
            'estimated_payment_amount',
            'note'
        ]
