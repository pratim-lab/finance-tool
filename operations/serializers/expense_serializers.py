from rest_framework import serializers

from tools.models import ExpenseType


class ExpenseTypeAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = ExpenseType
        fields = [
            'id',
            'expense_name',
        ]


class ExpenseTypeRetrieveSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExpenseType
        fields = [
            'id',
            'expense_name',
        ]
