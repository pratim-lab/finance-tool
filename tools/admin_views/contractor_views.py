from rest_framework import generics, filters, views
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.views.generic import TemplateView

from reports.admin import get_contractor_calc
from tools.admin_views.utils import ContractorAdminPagination
from tools.forms.contractor_forms import ContractorForm
from tools.models import Contractor
from tools.serializers.contractor_serializers import ListContractorRetrieveSerializer, ContractorAddSerializer, \
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
    ordering = ['created_at']

    def get_queryset(self):
        return Contractor.objects.all()


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

