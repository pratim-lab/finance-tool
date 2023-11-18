from django import forms
from operations.models import Expense
from tools.models import ExpenseType


class ExpenseTypeAddForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'form-control'
            })

    class Meta:
        model = ExpenseType
        fields = [
            'expense_name',
            'expense_description'
        ]


class ExpenseAddForm(forms.ModelForm):
    date_of_first_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    date_of_last_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'form-control'
            })

    class Meta:
        model = Expense
        fields = [
            'expense_type',
            'expense_type_other',
            'recurring_payment',
            'expense_payment_amount',
            'expense_frequency',
            'date_of_first_payment',
            'date_of_last_payment',
        ]
