from rest_framework import generics, filters, views
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from reports.admin import get_contractor_calc
from people.admin_views.utils import ContractorAdminPagination
from people.models import Contractor
from people.serializers.contractor_serializers import ListContractorRetrieveSerializer, ContractorAddSerializer, \
    ContractorRetrieveSerializer, ExpenseContractorSerializer


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
    pagination_class = ContractorAdminPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Contractor.objects.all().prefetch_related('contractor_projects')


class ContractorReportView(views.APIView):
    def get(self, request):
        year, months, contractors, rows, monthly_total_items, total = get_contractor_calc()
        resp_data = {
            'year': year,
            'months': months,
            'rows': rows,
            'monthly_total_items': monthly_total_items,
            'total': total,
            'contractors': ExpenseContractorSerializer(contractors, many=True).data
        }
        return Response(resp_data)

