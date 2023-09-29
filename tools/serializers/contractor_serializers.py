from rest_framework import serializers

from tools.models import Contractor


class ContractorAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Contractor
        fields = [
            'id',
            'contractor_name',
            'address1',
            'address2',
            'city',
            'state',
            'country',
            'zipcode',
            'contractor_start_date',
            'contractor_hourly_salary',
            'contractor_expected_weekly_hours',
            'contractor_estimated_weekly_salary',
        ]


class ContractorRetrieveSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contractor
        fields = [
            'id',
            'contractor_name',
            'address1',
            'address2',
            'city',
            'state',
            'country',
            'zipcode',
            'contractor_start_date',
            'contractor_hourly_salary',
            'contractor_expected_weekly_hours',
            'contractor_estimated_weekly_salary',
            'created_at',
        ]


class ListContractorRetrieveSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contractor
        fields = [
            'id',
            'contractor_name',
            'address1',
            'address2',
            'city',
            'state',
            'country',
            'zipcode',
            'contractor_start_date',
            'contractor_hourly_salary',
            'contractor_expected_weekly_hours',
            'contractor_estimated_weekly_salary',
            'created_at',
        ]


class ExpenseContractorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contractor
        fields = [
            'id',
            'contractor_name',
        ]
