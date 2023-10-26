import django_filters
from rest_framework import generics, filters
from rest_framework.permissions import IsAdminUser

from operations.admin_views.utils import AdminPagination
from operations.models import Project
from operations.serializers.project_serializers import ProjectAddSerializer, ProjectRetrieveSerializer, \
    ListProjectRetrieveSerializer


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
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = ['project_type']
    ordering_fields = ['project_name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Project.objects.all()
