import datetime

from rest_framework import serializers

from people.serializers.utils import get_current_year, get_months
from reports.models import ContractorMonthlyExpense
from tools.models import Contractor, Project


def get_contractor_expense(contractor):
    year = get_current_year()
    previously_updated_expenses = ContractorMonthlyExpense.objects.filter(
        year=year,
        contractor=contractor
    )
    expenses = dict()
    for expense in previously_updated_expenses:
        key = '{}_{}_{}'.format(expense.contractor.id, expense.year, expense.month)
        expenses[key] = expense.expense
    columns = [{'id': contractor.id, 'name': contractor.contractor_name}]
    contractors_total = 0
    months = get_months()
    for m in months:
        key = '{}_{}_{}'.format(contractor.id, year, m['id'])
        if key in expenses:
            columns.append({
                'year': year,
                'month': m['id'],
                'expense': expenses[key],
                'updated': True
            })
            contractors_total = contractors_total + float(expenses[key])
        else:
            date = datetime.datetime.strptime('{}-{}-{}'.format(1, m['id'], year), '%d-%m-%Y').date()
            start_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                                 contractor.contractor_start_date.month,
                                                                                 contractor.contractor_start_date.year),
                                                               '%d-%m-%Y').date()
            if start_month_first_day <= date:
                expense = float(contractor.contractor_hourly_salary) * float(contractor.contractor_expected_weekly_hours) * 4
            else:
                expense = 0
            columns.append({
                'year': year,
                'month': m['id'],
                'expense': expense,
                'updated': False
            })
            contractors_total = contractors_total + expense
    columns.append(contractors_total)
    return columns


class ContractorAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    expense = serializers.SerializerMethodField(read_only=True)

    def get_expense(self, obj):
        return get_contractor_expense(obj)

    class Meta:
        model = Contractor
        fields = [
            'id',
            'contractor_name',
            'contractor_role',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'contractor_start_date',
            'contractor_hourly_salary',
            'contractor_expected_weekly_hours',
            'contractor_estimated_weekly_salary',
            'is_active',
            'expense',
        ]


class ContractorRetrieveSerializer(serializers.ModelSerializer):
    expense = serializers.SerializerMethodField(read_only=True)

    def get_expense(self, obj):
        return get_contractor_expense(obj)

    class Meta:
        model = Contractor
        fields = [
            'id',
            'contractor_name',
            'contractor_role',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'contractor_start_date',
            'contractor_hourly_salary',
            'contractor_expected_weekly_hours',
            'contractor_estimated_weekly_salary',
            'created_at',
            'is_active',
            'expense',
        ]


class ContactorProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id',
            'project_name'
        ]


class ListContractorRetrieveSerializer(serializers.ModelSerializer):
    projects = serializers.SerializerMethodField()

    def get_projects(self, obj):
        project_contractors_ids = obj.contractor_projects.all().values_list('project_id', flat=True)
        projects = Project.objects.filter(id__in=project_contractors_ids)
        return ContactorProjectSerializer(projects, many=True).data

    class Meta:
        model = Contractor
        fields = [
            'id',
            'contractor_name',
            'contractor_role',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'contractor_start_date',
            'contractor_hourly_salary',
            'contractor_expected_weekly_hours',
            'contractor_estimated_weekly_salary',
            'is_active',
            'created_at',
            'projects'
        ]


class ExpenseContractorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contractor
        fields = [
            'id',
            'contractor_name',
        ]
