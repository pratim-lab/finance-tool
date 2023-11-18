from rest_framework import serializers

from operations.models import Expense
from operations.serializers.choice_field import ChoiceField
from tools.models import ExpenseType


class ExpenseTypeAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = ExpenseType
        fields = [
            'id',
            'expense_name',
            'expense_description',
        ]


class ExpenseTypeRetrieveSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExpenseType
        fields = [
            'id',
            'expense_name',
            'expense_description'
        ]


class ExpenseAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    date_of_last_payment = serializers.DateField(allow_null=True)
    expense_type_alt = ExpenseTypeRetrieveSerializer(source='expense_type', read_only=True)
    recurring_payment_alt = ChoiceField(choices=Expense.RECURRING_PAYMENT, read_only=True, source='recurring_payment')

    class Meta:
        model = Expense
        fields = [
            'id',
            'expense_type',
            'expense_type_other',
            'recurring_payment',
            'expense_payment_amount',
            'expense_frequency',
            'date_of_first_payment',
            'date_of_last_payment',
            'expense_type_alt',
            'recurring_payment_alt'
        ]


class ExpenseRetrieveSerializer(serializers.ModelSerializer):
    expense_type = ExpenseTypeRetrieveSerializer()
    # recurring_payment = ChoiceField(choices=Expense.RECURRING_PAYMENT)

    class Meta:
        model = Expense
        fields = [
            'id',
            'expense_type',
            'expense_type_other',
            'recurring_payment',
            'expense_payment_amount',
            'expense_frequency',
            'date_of_first_payment',
            'date_of_last_payment',
            'created_at'
        ]


class ListExpenseSerializer(serializers.ModelSerializer):
    expense_type = ExpenseTypeRetrieveSerializer()
    recurring_payment = ChoiceField(choices=Expense.RECURRING_PAYMENT)

    class Meta:
        model = Expense
        fields = [
            'id',
            'expense_type',
            'expense_type_other',
            'recurring_payment',
            'expense_payment_amount',
            'expense_frequency',
            'date_of_first_payment',
            'date_of_last_payment',
            'created_at'
        ]
