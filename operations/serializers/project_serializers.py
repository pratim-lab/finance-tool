from rest_framework import serializers
from django.utils import dateformat
from tools.models import Client, Project, ClientType, Contractor, Employee


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


class ProjectAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    client = ProjectClientSerializer(read_only=True)
    client_id = serializers.IntegerField()
    project_type = ChoiceField(choices=Project.PROJECT_TYPES)
    p_type = serializers.CharField(source='project_type', read_only=True)
    billing_structure = ChoiceField(choices=Project.BILLING_STRUCTURE)
    b_structure = serializers.CharField(source='billing_structure', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'client_id',
            'client',
            'project_name',
            'project_type',
            'p_type',
            'start_date',
            'end_date',
            'project_budget',
            'billing_structure',
            'b_structure'
        ]


class ProjectRetrieveSerializer(serializers.ModelSerializer):
    client = ProjectClientSerializer()
    p_type = ChoiceField(choices=Project.PROJECT_TYPES, source='project_type')
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
            'p_type',
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


class ProjectContractorSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='contractor_id')
    contractor_name = serializers.SerializerMethodField()
    contractor_role = serializers.SerializerMethodField()

    def get_contractor_name(self, obj):
        return obj.contractor.contractor_name

    def get_contractor_role(self, obj):
        return obj.contractor.contractor_role


class ProjectEmployeeSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='employee_id')
    employee_name = serializers.SerializerMethodField()
    project_role = serializers.SerializerMethodField()

    def get_employee_name(self, obj):
        return obj.employee.employee_name

    def get_project_role(self, obj):
        return obj.employee.project_role


class ProjectStaffUpdateSerializer(serializers.Serializer):
    contractor_ids = serializers.ListSerializer(child=serializers.IntegerField(required=True), required=True)
    employee_ids = serializers.ListSerializer(child=serializers.IntegerField(required=True), required=True)


class ContractorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contractor
        fields = [
            'id',
            'contractor_name'
        ]


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'id',
            'employee_name'
        ]
