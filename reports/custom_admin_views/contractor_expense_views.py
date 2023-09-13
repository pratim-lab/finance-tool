from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from reports.models import ContractorMonthlyExpense, TypeTotalExpense
from reports.serializers import ContractorMonthlyExpenseEditSerializer, TypeTotalExpenseEditSerializer
from tools.models import Contractor, Expense

from reports.models import EmployeeMonthlyExpense
from reports.serializers import EmployeeMonthlyExpenseEditSerializer
from tools.models import Employee


@api_view(['POST'])
def contractor_monthly_expense_edit_view(request):
    serializer = ContractorMonthlyExpenseEditSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    contractor = Contractor.objects.filter(id=data['contractor_id']).first()
    if contractor is None:
        return Response({'message': 'Contractor is not found'}, status=status.HTTP_400_BAD_REQUEST)
    monthly_expense, created = ContractorMonthlyExpense.objects.update_or_create(
        contractor=contractor,
        year=data['year'],
        month=data['month'],
        defaults={
            'expense': data['expense']
        }
    )

    return Response({
        'contractor_id': contractor.id,
        'expense': monthly_expense.expense
    })


@api_view(['POST'])
def employee_monthly_expense_edit_view(request):
    serializer = EmployeeMonthlyExpenseEditSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    employee = Employee.objects.filter(id=data['employee_id']).first()
    if employee is None:
        return Response({'message': 'Employee is not found'}, status=status.HTTP_400_BAD_REQUEST)
    monthly_expense, created = EmployeeMonthlyExpense.objects.update_or_create(
        employee=employee,
        year=data['year'],
        month=data['month'],
        defaults={
            'expense': data['expense']
        }
    )

    return Response({
        'employee_id': employee.id,
        'expense': monthly_expense.expense
    })


@api_view(['POST'])
def type_total_expense_edit_view(request):
    serializer = TypeTotalExpenseEditSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    matched = False
    for expense_type in Expense.EXPENSE_TYPE:
        if data['expense_type'] == expense_type[0]:
            matched = True
            break
    if not matched:
        return Response({'message': 'Expense type is not valid'}, status=status.HTTP_400_BAD_REQUEST)

    monthly_expense, created = TypeTotalExpense.objects.update_or_create(
        expense_type=data['expense_type'],
        year=data['year'],
        month=data['month'],
        defaults={
            'expense': data['expense']
        }
    )

    return Response({
        'id': monthly_expense.id,
        'expense': monthly_expense.expense
    })
