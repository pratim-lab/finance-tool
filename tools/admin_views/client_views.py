import django_filters
from rest_framework import generics, filters
from rest_framework.permissions import IsAdminUser

from tools.admin_views.utils import AdminPagination
from tools.models import Client
from tools.serializers.client_serializers import ClientAddSerializer, ClientRetrieveSerializer, \
    ListClientRetrieveSerializer
# from django.db import connection
# connection.queries


class ClientCreateAdminAPIView(generics.CreateAPIView):

    def get_queryset(self):
        return Client.objects.all()

    def get_serializer_class(self):
        return ClientAddSerializer


class ClientRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):

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
    filterset_fields = ['client_type', 'city']
    ordering_fields = ['client_name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Client.objects.prefetch_related('project_set').all()
