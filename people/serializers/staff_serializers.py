import datetime

from rest_framework import serializers

from people.models import Staff
from people.serializers.fields import ChoiceField
from people.serializers.utils import get_current_year, get_months
from reports.models import EmployeeMonthlyExpense
from tools.models import Employee


class StaffAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    benefits = ChoiceField(choices=Staff.BENEFITS)
    expense = serializers.SerializerMethodField()

    def get_expense(self, obj):
        return get_employee_expense(obj)

    class Meta:
        model = Staff
        fields = [
            'id',
            'employee_name',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'employee_start_date',
            'payment_structure',
            'employee_monthly_salary',
            'employee_monthly_tax',
            'employee_net_income',
            'project_role',
            'fte_billable_rate',
            'benefits',
            'expense'
        ]


def get_employee_expense(staff):
    year = get_current_year()
    months = get_months()
    previously_updated_expenses = EmployeeMonthlyExpense.objects.filter(
        year=year,
        employee_id=staff.id
    )
    expenses = dict()
    for expense in previously_updated_expenses:
        key = '{}_{}_{}'.format(expense.employee.id, expense.year, expense.month)
        expenses[key] = expense.expense
    employees_total = 0
    expense_columns = []
    columns = [{'id': staff.id, 'name': staff.employee_name}]
    for m in months:
        key = '{}_{}_{}'.format(staff.id, year, m['id'])
        if key in expenses:
            columns.append({
                'year': year,
                'month': m['id'],
                'expense': expenses[key],
                'updated': True
            })
            expense_columns.append(float(expenses[key]))
            employees_total = employees_total + float(expenses[key])
        else:
            date = datetime.datetime.strptime('{}-{}-{}'.format(1, m['id'], year), '%d-%m-%Y').date()
            start_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                                 staff.employee_start_date.month,
                                                                                 staff.employee_start_date.year),
                                                               '%d-%m-%Y').date()
            if start_month_first_day <= date:
                if staff.payment_structure == 'W':
                    expense = float(staff.employee_monthly_salary) * 4
                elif staff.payment_structure == 'BM':
                    expense = float(staff.employee_monthly_salary) * 2
                else:
                    expense = float(staff.employee_monthly_salary)
            else:
                expense = 0
            columns.append({
                'year': year,
                'month': m['id'],
                'expense': expense,
                'updated': False
            })
            employees_total = employees_total + expense
            expense_columns.append(expense)
    columns.append(employees_total)
    return columns


class StaffRetrieveSerializer(serializers.ModelSerializer):
    expense = serializers.SerializerMethodField()

    def get_expense(self, obj):
        return get_employee_expense(obj)

    class Meta:
        model = Staff
        fields = [
            'id',
            'employee_name',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'employee_start_date',
            'payment_structure',
            'employee_monthly_salary',
            'employee_monthly_tax',
            'employee_net_income',
            'project_role',
            'fte_billable_rate',
            'benefits',
            'created_at',
            'expense'
        ]


class ListStaffRetrieveSerializer(serializers.ModelSerializer):
    benefits = ChoiceField(choices=Staff.BENEFITS)

    class Meta:
        model = Staff
        fields = [
            'id',
            'employee_name',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'employee_start_date',
            'payment_structure',
            'employee_monthly_salary',
            'employee_monthly_tax',
            'employee_net_income',
            'project_role',
            'fte_billable_rate',
            'benefits',
            'created_at',
        ]


class ReportStaffRetrieveSerializer(serializers.ModelSerializer):

    class Meta:
        model = Employee
        fields = [
            'id',
            'employee_name',
        ]
