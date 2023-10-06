from rest_framework import serializers

from people.models import Staff
from people.serializers.fields import ChoiceField


class StaffAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    benefits = ChoiceField(choices=Staff.BENEFITS)

    class Meta:
        model = Staff
        fields = [
            'id',
            'employee_name',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'employee_start_date',
            'payment_structure',
            'employee_monthly_salary',
            'employee_monthly_tax',
            'employee_net_income',
            'project_role',
            'fte_billable_rate',
            'benefits',
        ]


class StaffRetrieveSerializer(serializers.ModelSerializer):

    class Meta:
        model = Staff
        fields = [
            'id',
            'employee_name',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'employee_start_date',
            'payment_structure',
            'employee_monthly_salary',
            'employee_monthly_tax',
            'employee_net_income',
            'project_role',
            'fte_billable_rate',
            'benefits',
            'created_at',
        ]


class ListStaffRetrieveSerializer(serializers.ModelSerializer):
    benefits = ChoiceField(choices=Staff.BENEFITS)

    class Meta:
        model = Staff
        fields = [
            'id',
            'employee_name',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'employee_start_date',
            'payment_structure',
            'employee_monthly_salary',
            'employee_monthly_tax',
            'employee_net_income',
            'project_role',
            'fte_billable_rate',
            'benefits',
            'created_at',
        ]
