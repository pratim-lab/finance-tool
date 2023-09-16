import json

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


class ClientAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    client_type = ChoiceField(choices=Client.CLIENT_TYPES)
    billing_structure = ChoiceField(choices=Client.BILLING_STRUCTURE)
    payment_terms = ChoiceField(choices=Client.PAYMENT_TERMS)
    projects = serializers.SerializerMethodField()
    committed_annual_revenue = serializers.SerializerMethodField()
    projected_annual_revenue = serializers.SerializerMethodField()

    def get_projects(self, obj):
        active_projects = []
        pipeline_projects = []
        for project in obj.project_set.all():
            if project.project_type == 'A':
                active_projects.append(project)
            elif project.project_type == 'P':
                pipeline_projects.append(project)

        return {
            'active_projects': ClientProjectSerializer(active_projects, many=True).data,
            'pipeline_projects': ClientProjectSerializer(pipeline_projects, many=True).data,
        }

    def get_committed_annual_revenue(self, obj):
        return ''

    def get_projected_annual_revenue(self, obj):
        return ''

    class Meta:
        model = Client
        fields = [
            'id',
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
            'created_at',

            'projects',
            'committed_annual_revenue',
            'projected_annual_revenue',
        ]


class ClientRetrieveSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        return dateformat.format(obj.created_at, 'N j, Y, ') + dateformat.time_format(obj.created_at, 'g:i a')

    class Meta:
        model = Client
        fields = [
            'id',
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
            'created_at'
        ]


class ClientProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = [
            'id',
            'project_name',
            'project_type'
        ]


class ListClientRetrieveSerializer(serializers.ModelSerializer):
    client_type = ChoiceField(choices=Client.CLIENT_TYPES)
    projects = serializers.SerializerMethodField()
    committed_annual_revenue = serializers.SerializerMethodField()
    projected_annual_revenue = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id',
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
            'created_at',
            
            'projects',
            'committed_annual_revenue',
            'projected_annual_revenue',
        ]

    def get_projects(self, obj):
        active_projects = []
        pipeline_projects = []
        for project in obj.project_set.all():
            if project.project_type == 'A':
                active_projects.append(project)
            elif project.project_type == 'P':
                pipeline_projects.append(project)

        return {
            'active_projects': ClientProjectSerializer(active_projects, many=True).data,
            'pipeline_projects': ClientProjectSerializer(pipeline_projects, many=True).data,
        }

    def get_committed_annual_revenue(self, obj):
        return ''

    def get_projected_annual_revenue(self, obj):
        return ''
