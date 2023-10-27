from django import forms
from django.forms import BooleanField
from tools.models import Contractor


class ContractorForm(forms.ModelForm):
    contractor_start_date = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            if not isinstance(self.fields[field], BooleanField):
                self.fields[field].widget.attrs.update({
                    'class': 'form-control'
                })

    class Meta:
        model = Contractor
        widgets = {
            'address1': forms.Textarea(attrs={'rows': 3, }),
            'address2': forms.Textarea(attrs={'rows': 3, }),
            'contractor_hourly_salary': forms.NumberInput(),
            'contractor_expected_weekly_hours': forms.NumberInput(),
            'is_active': forms.CheckboxInput(attrs={'checked': ''})
        }
        fields = [
            'contractor_name',
            'contractor_role',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'contractor_start_date',
            'contractor_hourly_salary',
            'contractor_expected_weekly_hours',
            'contractor_estimated_weekly_salary',
            'is_active',
        ]
