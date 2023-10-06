from rest_framework import generics, filters
from rest_framework.permissions import IsAdminUser

from people.admin_views.utils import StaffAdminPagination
from people.models import Staff
from people.serializers.staff_serializers import ListStaffRetrieveSerializer, StaffAddSerializer, \
    StaffRetrieveSerializer


class StaffCreateAdminAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Staff.objects.all()

    def get_serializer_class(self):
        return StaffAddSerializer


class StaffRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Staff.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return StaffRetrieveSerializer
        elif self.request.method == "PATCH":
            return StaffAddSerializer


class StaffListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = ListStaffRetrieveSerializer
    pagination_class = StaffAdminPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Staff.objects.all()
