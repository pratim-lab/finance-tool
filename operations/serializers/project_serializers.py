from rest_framework import serializers
from django.utils import dateformat
from tools.models import Client, Project


class ChoiceField(serializers.ChoiceField):

    def to_representation(self, obj):
        if obj == '' and self.allow_blank:
            return obj
        return self._choices[obj]

    # def to_internal_value(self, data):
    #     # To support inserts with the value
    #     if data == '' and self.allow_blank:
    #         return ''
    #
    #     for key, val in self._choices.items():
    #         if val == data:
    #             return key
    #     self.fail('invalid_choice', input=data)


class ProjectAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    client_id = serializers.IntegerField()
    project_type = ChoiceField(choices=Project.PROJECT_TYPES)
    billing_structure = ChoiceField(choices=Project.BILLING_STRUCTURE)
   
    class Meta:
        model = Project
        fields = [
            'id',
            'client_id',
            'project_name',
            'project_type',
            'start_date',
            'end_date',
            'project_budget',
            'billing_structure'
        ]


class ProjectRetrieveSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        return dateformat.format(obj.created_at, 'N j, Y, ') + dateformat.time_format(obj.created_at, 'g:i a')

    class Meta:
        model = Project
        fields = [
            'id',
            'client_id',
            'project_name',
            'project_type',
            'start_date',
            'end_date',
            'project_budget',
            'billing_structure',
            'created_at'
        ]


class ProjectProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = [
            'id',
            'client_id',
            'project_name',
            'project_type',
            'start_date',
            'end_date',
            'project_budget',
            'billing_structure',
        ]


class ListProjectRetrieveSerializer(serializers.ModelSerializer):
    client_id = serializers.IntegerField()
    project_type = ChoiceField(choices=Project.PROJECT_TYPES)
    billing_structure = ChoiceField(choices=Project.BILLING_STRUCTURE)
    
    class Meta:
        model = Project
        fields = [
            'id',
            'client_id',
            'project_name',
            'project_type',
            'start_date',
            'end_date',
            'project_budget',
            'billing_structure',
        ]