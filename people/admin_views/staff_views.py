from rest_framework import generics, filters, views
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from people.admin_views.utils import StaffAdminPagination
from people.models import Staff
from people.serializers.staff_serializers import ListStaffRetrieveSerializer, StaffAddSerializer, \
    StaffRetrieveSerializer, ReportStaffRetrieveSerializer
from reports.admin import get_employee_calc


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


class EmployeeReportView(views.APIView):
    def get(self, request):
        year, months, employees, rows, monthly_total_items, total = get_employee_calc()
        resp_data = {
            'year': year,
            'months': months,
            'rows': rows,
            'monthly_total_items': monthly_total_items,
            'total': total,
            'contractors': ReportStaffRetrieveSerializer(employees, many=True).data
        }
        return Response(resp_data)
