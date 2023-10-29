from django import forms
from tools.models import Invoice


class InvoiceAddForm(forms.ModelForm):
    invoice_date = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    expected_date_of_payment = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'form-control'
            })

    class Meta:
        model = Invoice
        fields = [
            'client',
            'project',
            'invoice_date',
            'invoice_number',
            'invoice_status',
            'expected_date_of_payment',
            'invoice_amount',
        ]
