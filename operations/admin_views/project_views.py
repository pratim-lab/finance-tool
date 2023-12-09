import django_filters
from rest_framework import generics, filters, views, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from operations.admin_views.utils import AdminPagination
from operations.models import Project
from operations.serializers.project_serializers import ProjectAddSerializer, ProjectRetrieveSerializer, \
    ListProjectRetrieveSerializer, ProjectContractorSerializer, ProjectEmployeeSerializer, ProjectStaffUpdateSerializer, \
    EmployeeSerializer, ContractorSerializer
from tools.models import ProjectContractor, ProjectEmployee, Contractor, Employee


class ProjectCreateAdminAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Project.objects.all()

    def get_serializer_class(self):
        return ProjectAddSerializer


class ProjectRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Project.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ProjectRetrieveSerializer
        elif self.request.method == "PATCH":
            return ProjectAddSerializer


class ProjectListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = ListProjectRetrieveSerializer
    pagination_class = AdminPagination
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project_type']
    ordering_fields = ['project_name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Project.objects.all()


class ProjectStaffView(views.APIView):
    permission_classes = [IsAdminUser, ]

    def get(self, request, pk):
        project_contractors = ProjectContractor.objects.filter(project_id=pk).prefetch_related('contractor')
        project_employees = ProjectEmployee.objects.filter(project_id=pk).prefetch_related('employee')
        resp_data = {
            'contractors': ProjectContractorSerializer(project_contractors, many=True).data,
            'employees': ProjectEmployeeSerializer(project_employees, many=True).data
        }
        return Response(resp_data)

    def patch(self, request, pk):
        serializer = ProjectStaffUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        ProjectContractor.objects.filter(project_id=pk).exclude(
            contractor_id__in=serializer.data['contractor_ids']).delete()
        for contractor_id in serializer.data['contractor_ids']:
            obj, created = ProjectContractor.objects.update_or_create(
                project_id=pk,
                contractor_id=contractor_id
            )
        ProjectEmployee.objects.filter(project_id=pk).exclude(employee_id__in=serializer.data['employee_ids']).delete()
        for employee_id in serializer.data['employee_ids']:
            obj, created = ProjectEmployee.objects.update_or_create(
                project_id=pk,
                employee_id=employee_id
            )
        project_contractors = ProjectContractor.objects.filter(project_id=pk).prefetch_related('contractor')
        project_employees = ProjectEmployee.objects.filter(project_id=pk).prefetch_related('employee')
        resp_data = {
            'contractors': ProjectContractorSerializer(project_contractors, many=True).data,
            'employees': ProjectEmployeeSerializer(project_employees, many=True).data
        }
        return Response(resp_data)


class AvailableStaffView(views.APIView):
    permission_classes = [IsAdminUser, ]

    def get(self, request, pk):
        contractors = Contractor.objects.exclude(id__in=ProjectContractor.objects.filter(project_id=pk).
                                                 values_list('contractor_id', flat=True))
        employees = Employee.objects.exclude(id__in=ProjectEmployee.objects.filter(project_id=pk).
                                             values_list('employee_id', flat=True))
        resp_data = {
            'contractors': ContractorSerializer(contractors, many=True).data,
            'employees': EmployeeSerializer(employees, many=True).data
        }
        return Response(resp_data)
