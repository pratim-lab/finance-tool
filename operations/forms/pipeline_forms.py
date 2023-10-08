from django import forms
from operations.models import Pipeline


class PipelineAddForm(forms.ModelForm):
    estimated_price = forms.NumberInput()
    confidence = forms.NumberInput()
    expected_date_of_first_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_second_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_third_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_forth_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_fifth_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_sixth_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_seventh_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_eighth_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_nineth_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_tenth_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_eleventh_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_twelfth_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    total_value_in_forecast = forms.NumberInput()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'form-control'
            })

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
