from django.forms import ModelForm

from tools.models import Client


class ClientAddForm(ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'form-control'
            })

    class Meta:
        model = Client
        fields = [
            'client_name',
            'address1',
            'address2',
            'city',
            'state',
            'country',
            'zipcode',
            'client_type',
            'billing_structure',
            'billing_target',
            'payment_terms',
        ]
