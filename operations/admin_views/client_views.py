import django_filters
from rest_framework import generics, filters
from rest_framework.permissions import IsAdminUser

from operations.admin_views.utils import AdminPagination
from operations.models import Client
from operations.serializers.client_serializers import ClientAddSerializer, ClientRetrieveSerializer, \
    ListClientRetrieveSerializer


class ClientCreateAdminAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Client.objects.all()

    def get_serializer_class(self):
        return ClientAddSerializer


class ClientRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Client.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ClientRetrieveSerializer
        elif self.request.method == "PATCH":
            return ClientAddSerializer


class ClientListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = ListClientRetrieveSerializer
    pagination_class = AdminPagination
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = ['client_status', 'city']
    # filterset_fields = ['client_type', 'city']
    ordering_fields = ['client_name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Client.objects.prefetch_related('project_set').all()
