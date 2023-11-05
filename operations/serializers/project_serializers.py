from rest_framework import serializers
from django.utils import dateformat
from tools.models import Client, Project, ClientType


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


class ClientTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientType
        fields = [
            'id',
            'name',
        ]


class ProjectClientSerializer(serializers.ModelSerializer):
    client_type = ClientTypeSerializer()

    class Meta:
        model = Client
        fields = [
            'id',
            'client_name',
            'client_type'
        ]


class ProjectRetrieveSerializer(serializers.ModelSerializer):
    client = ProjectClientSerializer()
    created_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        return dateformat.format(obj.created_at, 'N j, Y, ') + dateformat.time_format(obj.created_at, 'g:i a')

    class Meta:
        model = Project
        fields = [
            'id',
            'client_id',
            'client',
            'project_name',
            'project_type',
            'start_date',
            'end_date',
            'project_budget',
            'billing_structure',
            'created_at'
        ]


class ListProjectRetrieveSerializer(serializers.ModelSerializer):
    client = ProjectClientSerializer()
    client_id = serializers.IntegerField()
    project_type = ChoiceField(choices=Project.PROJECT_TYPES)
    billing_structure = ChoiceField(choices=Project.BILLING_STRUCTURE)
    
    class Meta:
        model = Project
        fields = [
            'id',
            'client_id',
            'client',
            'project_name',
            'project_type',
            'start_date',
            'end_date',
            'project_budget',
            'billing_structure',
        ]
