from django import forms
from tools.models import Project


class ProjectAddForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'form-control'
            })

    class Meta:
        model = Project
        # widgets = {
        #     'address1': forms.Textarea(attrs={'rows': 3, }),
        #     'address2': forms.Textarea(attrs={'rows': 3, }),
        #     'billing_target': forms.Textarea(attrs={'rows': 3, }),
        # }
        fields = [
            'client',
            'project_name',
            'project_type',
            'billing_structure',
        ]
