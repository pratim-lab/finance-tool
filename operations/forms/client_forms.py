from django import forms
from tools.models import Client


class ClientAddForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'form-control'
            })

    class Meta:
        model = Client
        widgets = {
            'address1': forms.Textarea(attrs={'rows': 3, }),
            'address2': forms.Textarea(attrs={'rows': 3, }),
            'billing_target': forms.Textarea(attrs={'rows': 3, }),
        }
        fields = [
            'client_name',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'client_type',
            'billing_structure',
            'billing_target',
            'payment_terms',
        ]
