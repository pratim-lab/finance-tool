from rest_framework import generics, filters, views, status
from rest_framework.permissions import IsAdminUser

from people.admin_views.utils import VendorAdminPagination
from people.models import Vendor
from people.serializers.vendor_serializers import VendorAddSerializer


class VendorCreateAdminAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Vendor.objects.all()

    def get_serializer_class(self):
        return VendorAddSerializer


class VendorRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Vendor.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return VendorAddSerializer
        elif self.request.method == "PATCH":
            return VendorAddSerializer


class VendorListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = VendorAddSerializer
    pagination_class = VendorAdminPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Vendor.objects.all()
