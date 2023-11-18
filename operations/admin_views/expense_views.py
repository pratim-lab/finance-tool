import django_filters
from rest_framework import views, generics, filters
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from operations.admin_views.utils import AdminPagination
from operations.models import Expense
from operations.serializers.expense_serializers import ExpenseTypeRetrieveSerializer, ExpenseTypeAddSerializer, \
    ExpenseAddSerializer, ExpenseRetrieveSerializer, ListExpenseSerializer
from reports.admin import get_expense_calc_alt
from tools.models import ExpenseType


class ExpenseReportAPIView(views.APIView):

    def get(self, request):
        year, months, type_total_expenses, monthly_total_expenses, total, rows = get_expense_calc_alt()
        resp_data = {
            'year': year,
            'months': months,
            'rows': rows,
            'type_total_expenses': type_total_expenses,
            'monthly_total_expenses': monthly_total_expenses,
            'total': total,


        }
        return Response(resp_data)


class ExpenseTypeCreateAdminAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return ExpenseType.objects.all()

    def get_serializer_class(self):
        return ExpenseTypeAddSerializer


class ExpenseTypeListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = ExpenseTypeRetrieveSerializer
    pagination_class = None
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return ExpenseType.objects.all()


class ExpenseTypeRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return ExpenseType.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ExpenseTypeRetrieveSerializer
        elif self.request.method == "PATCH":
            return ExpenseTypeAddSerializer


class ExpenseCreateAdminAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Expense.objects.all()

    def get_serializer_class(self):
        return ExpenseAddSerializer


class ExpenseListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = ListExpenseSerializer
    pagination_class = AdminPagination
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Expense.objects.all()


class ExpenseRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Expense.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ExpenseRetrieveSerializer
        elif self.request.method == "PATCH":
            return ExpenseAddSerializer
