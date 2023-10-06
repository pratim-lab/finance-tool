from django import forms
from django.forms import BooleanField

from people.models import Staff


class StaffForm(forms.ModelForm):
    employee_start_date = forms.DateField(widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date'}))
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            if not isinstance(self.fields[field], BooleanField):
                self.fields[field].widget.attrs.update({
                    'class': 'form-control'
                })

    class Meta:
        model = Staff
        widgets = {
            'address1': forms.Textarea(attrs={'rows': 3, }),
            'address2': forms.Textarea(attrs={'rows': 3, }),
            'employee_monthly_salary': forms.NumberInput(),
            'fte_billable_rate': forms.NumberInput(),
            'employee_start_date': forms.DateInput(),
        }
        fields = [
            'employee_name',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'employee_start_date',
            'payment_structure',
            'employee_monthly_salary',
            'employee_monthly_tax',
            'employee_net_income',
            'project_role',
            'fte_billable_rate',
            'benefits'
        ]
