from rest_framework import generics, filters
from rest_framework.permissions import IsAdminUser
from tools.admin_views.utils import AdminPagination
from tools.models import Contractor
from tools.serializers.contractor_serializers import ListContractorRetrieveSerializer, ContractorAddSerializer, \
    ContractorRetrieveSerializer


class ContractorCreateAdminAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Contractor.objects.all()

    def get_serializer_class(self):
        return ContractorAddSerializer


class ContractorRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Contractor.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ContractorRetrieveSerializer
        elif self.request.method == "PATCH":
            return ContractorAddSerializer


class ContractorListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = ListContractorRetrieveSerializer
    pagination_class = AdminPagination
    ordering = ['-created_at']

    def get_queryset(self):
        return Contractor.objects.all()
