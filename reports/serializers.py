import datetime

from rest_framework import serializers


def current_year():
    return datetime.date.today().year


class ContractorMonthlyExpenseEditSerializer(serializers.Serializer):
    contractor_id = serializers.IntegerField(allow_null=False, required=True, initial='contractorId')
    year = serializers.IntegerField(allow_null=False, required=True, min_value=2000, max_value=current_year())
    month = serializers.IntegerField(allow_null=False, required=True, min_value=1, max_value=12)
    expense = serializers.DecimalField(allow_null=False, required=True, max_digits=10, decimal_places=2, min_value=0)


class EmployeeMonthlyExpenseEditSerializer(serializers.Serializer):
    employee_id = serializers.IntegerField(allow_null=False, required=True, initial='employeeId')
    year = serializers.IntegerField(allow_null=False, required=True, min_value=2000, max_value=current_year())
    month = serializers.IntegerField(allow_null=False, required=True, min_value=1, max_value=12)
    expense = serializers.DecimalField(allow_null=False, required=True, max_digits=10, decimal_places=2, min_value=0)


class TypeTotalExpenseEditSerializer(serializers.Serializer):
    expense_type = serializers.CharField(allow_null=False, required=True)
    year = serializers.IntegerField(allow_null=False, required=True, min_value=2000, max_value=current_year())
    month = serializers.IntegerField(allow_null=False, required=True, min_value=1, max_value=12)
    expense = serializers.DecimalField(allow_null=False, required=True, max_digits=10, decimal_places=2, min_value=0)


class TypeTotalExpenseEditSerializerAlt(serializers.Serializer):
    expense_type_id = serializers.IntegerField(allow_null=False, required=True)
    year = serializers.IntegerField(allow_null=False, required=True, min_value=2000, max_value=current_year())
    month = serializers.IntegerField(allow_null=False, required=True, min_value=1, max_value=12)
    expense = serializers.DecimalField(allow_null=False, required=True, max_digits=10, decimal_places=2, min_value=0)