from django import forms
from django.forms import BooleanField

from people.models import Vendor


class VendorForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            if not isinstance(self.fields[field], BooleanField):
                self.fields[field].widget.attrs.update({
                    'class': 'form-control'
                })

    class Meta:
        model = Vendor
        widgets = {
            'vendor_description': forms.Textarea(attrs={'rows': 3, }),
        }
        fields = [
            'vendor_name',
            'vendor_description'
        ]
