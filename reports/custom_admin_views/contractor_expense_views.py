import datetime

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from reports.models import ContractorMonthlyExpense, TypeTotalExpense
from reports.serializers import ContractorMonthlyExpenseEditSerializer, TypeTotalExpenseEditSerializer, \
    TypeTotalExpenseEditSerializerAlt, ContractorMonthlyExpenseResetSerializer, EmployeeMonthlyExpenseResetSerializer, \
    TypeTotalExpenseResetSerializerAlt
from tools.models import Contractor, Expense, ExpenseType

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
def contractor_monthly_expense_reset_view(request):
    serializer = ContractorMonthlyExpenseResetSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    contractor = Contractor.objects.filter(id=data['contractor_id']).first()
    if contractor is None:
        return Response({'message': 'Contractor is not found'}, status=status.HTTP_400_BAD_REQUEST)

    ContractorMonthlyExpense.objects.filter(
        contractor=contractor,
        year=data['year'],
        month=data['month']
    ).delete()

    date = datetime.datetime.strptime('{}-{}-{}'.format(1, data['month'], data['year']), '%d-%m-%Y').date()
    start_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         contractor.contractor_start_date.month,
                                                                         contractor.contractor_start_date.year),
                                                       '%d-%m-%Y').date()
    if start_month_first_day <= date:
        expense = float(contractor.contractor_hourly_salary) * float(contractor.contractor_expected_weekly_hours) * 4
    else:
        expense = 0

    return Response({
        'contractor_id': contractor.id,
        'expense': expense
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
def employee_monthly_expense_reset_view(request):
    serializer = EmployeeMonthlyExpenseResetSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    employee = Employee.objects.filter(id=data['employee_id']).first()
    if employee is None:
        return Response({'message': 'Employee is not found'}, status=status.HTTP_400_BAD_REQUEST)
    EmployeeMonthlyExpense.objects.filter(
        employee=employee,
        year=data['year'],
        month=data['month']
    ).delete()
    date = datetime.datetime.strptime('{}-{}-{}'.format(1, data['month'], data['year']), '%d-%m-%Y').date()
    start_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         employee.employee_start_date.month,
                                                                         employee.employee_start_date.year),
                                                       '%d-%m-%Y').date()
    if start_month_first_day <= date:
        if employee.payment_structure == 'W':
            expense = float(employee.employee_monthly_salary) * 4
        elif employee.payment_structure == 'BM':
            expense = float(employee.employee_monthly_salary) * 2
        else:
            expense = float(employee.employee_monthly_salary)
    else:
        expense = 0
    return Response({
        'employee_id': employee.id,
        'expense': expense
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


@api_view(['POST'])
def type_total_expense_edit_view_alt(request):
    serializer = TypeTotalExpenseEditSerializerAlt(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    if not ExpenseType.objects.filter(id=data['expense_type_id']).exists():
        return Response({'message': 'Expense type is not valid'}, status=status.HTTP_400_BAD_REQUEST)

    monthly_expense, created = TypeTotalExpense.objects.update_or_create(
        expense_type_id=data['expense_type_id'],
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


def get_month_expense(expense, year, month):
    date = datetime.datetime.strptime('{}-{}-{}'.format(1, month, year), '%d-%m-%Y').date()
    start_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         expense.date_of_first_payment.month,
                                                                         expense.date_of_first_payment.year),
                                                       '%d-%m-%Y').date()
    if expense.recurring_payment == 'Y':
        last_payment_date = expense.date_of_last_payment if expense.date_of_last_payment is not None \
            else datetime.datetime.strptime('{}-{}-{}'.format(1, month, year), '%d-%m-%Y').date()

        if expense.expense_frequency == 'Q':
            if start_month_first_day <= date <= last_payment_date:
                diff = month - expense.date_of_first_payment.month
                if diff % 3 == 0:
                    actual_expense = float(expense.expense_payment_amount)
                else:
                    actual_expense = 0
            else:
                actual_expense = 0
        else:
            if start_month_first_day <= date <= last_payment_date:
                actual_expense = expense.get_monthly_expense()
            else:
                actual_expense = 0
    else:
        if start_month_first_day == date:
            actual_expense = float(expense.expense_payment_amount)
        else:
            actual_expense = 0

    return float(actual_expense)


@api_view(['POST'])
def type_total_expense_reset_view(request):
    serializer = TypeTotalExpenseResetSerializerAlt(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    if not ExpenseType.objects.filter(id=data['expense_type_id']).exists():
        return Response({'message': 'Expense type is not valid'}, status=status.HTTP_400_BAD_REQUEST)

    TypeTotalExpense.objects.filter(
        expense_type_id=data['expense_type_id'],
        year=data['year'],
        month=data['month']
    ).delete()

    year = data['year']
    m = data['month']

    grouped_expense = {}
    type_total_expenses = {}
    monthly_total_expenses = {}
    total = 0

    monthly_total_expenses[m] = 0

    expense_types = ExpenseType.objects.all()
    expense_type_map = {}
    for e in expense_types:
        expense_type_map[e.expense_name] = e.id

    for e in expense_types:
        type_total_expenses[e.expense_name] = 0
        m_dict = {}
        m_dict[m] = {'expense': 0, 'updated': False}
        grouped_expense[e.expense_name] = {
            year: m_dict
        }
    expenses_list = Expense.objects.filter(expense_type_id=data['expense_type_id'])
    for e in expenses_list:
        ex = get_month_expense(e, year, m)
        grouped_expense[e.expense_type.expense_name][year][m]['expense'] = \
        grouped_expense[e.expense_type.expense_name][year][m]['expense'] + ex

    for ex_type, value in grouped_expense.items():
        for year, value2 in value.items():
            for month, expense in value2.items():
                monthly_total_expenses[month] = monthly_total_expenses[month] + expense['expense']
                type_total_expenses[ex_type] = type_total_expenses[ex_type] + expense['expense']
                total = total + expense['expense']

    rows = []
    for ex_type, value in grouped_expense.items():
        if type_total_expenses[ex_type] == 0:
            continue
        row = [{'name': ex_type, 'id': expense_type_map[ex_type]}]
        for year, value2 in value.items():
            for month, expense in value2.items():
                row.append({
                    'year': year,
                    'month': month,
                    'expense': expense['expense'],
                    'updated': expense['updated']
                })
        rows.append(row)

    return Response({
        'id': data['expense_type_id'],
        'expense': rows
    })
