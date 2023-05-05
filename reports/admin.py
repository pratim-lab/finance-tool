import datetime
import numpy as np
import json

from django.contrib import admin
from django.core.exceptions import PermissionDenied
from django.template.response import TemplateResponse
from django.urls import path
from django.contrib.auth.admin import csrf_protect_m

from reports.custom_admin_views.contractor_expense_views import contractor_monthly_expense_edit_view
from reports.models import ContractorMonthlyExpense, ContractorMonthlyExpenseReport, TypeTotalExpense, \
    TypeTotalExpenseReport
from tools.models import Contractor

from reports.custom_admin_views.contractor_expense_views import employee_monthly_expense_edit_view
from reports.models import EmployeeMonthlyExpense, EmployeeMonthlyExpenseReport
from tools.models import Employee

from reports.custom_admin_views.contractor_expense_views import type_total_expense_edit_view
from tools.models import Expense
from tools.models import ExpenseType

from reports.models import InvoiceMonthlyExpenseReport
from tools.models import Invoice

from reports.models import PipelineMonthlyExpenseReport
from tools.models import Pipeline
from tools.models import Client


def get_months():
    return [
        {'id': 1, 'value': 'January'},
        {'id': 2, 'value': 'February'},
        {'id': 3, 'value': 'March'},
        {'id': 4, 'value': 'April'},
        {'id': 5, 'value': 'May'},
        {'id': 6, 'value': 'June'},
        {'id': 7, 'value': 'July'},
        {'id': 8, 'value': 'August'},
        {'id': 9, 'value': 'September'},
        {'id': 10, 'value': 'October'},
        {'id': 11, 'value': 'November'},
        {'id': 12, 'value': 'December'}
    ]


def get_current_year():
    return datetime.datetime.now().year


class ContractorMonthlyExpenseAdmin(admin.ModelAdmin):
    change_list_template = 'admin/contractor_expense_page.html'

    def has_add_permission(self, request, obj=None):
        return False

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [path("edit", self.admin_site.admin_view(contractor_monthly_expense_edit_view))]
        return my_urls + urls

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        """
        The 'change list' admin view for this model.
        """
        if not self.has_view_or_change_permission(request):
            raise PermissionDenied

        previously_updated_expenses = ContractorMonthlyExpense.objects.all()
        expenses = dict()
        for expense in previously_updated_expenses:
            key = '{}_{}_{}'.format(expense.contractor.id, expense.year, expense.month)
            expenses[key] = expense.expense

        contractors = Contractor.objects.all()
        if len(contractors) == 0:
            context = {
                **self.admin_site.each_context(request),
                'title': "Contractors Salary Report",
                'subtitle': None,
                'has_add_permission': self.has_add_permission(request),
                **(extra_context or {}),
                # page specific
                'contractor_exists': False
            }
            request.current_app = self.admin_site.name
            return TemplateResponse(request, self.change_list_template, context)

        months = get_months()
        year = get_current_year()
        exp = []
        rows = []
        for c in contractors:
            columns = [{'id': c.id, 'name': c.contractor_name}]
            contractors_total = 0
            expense_columns = []
            for m in months:
                key = '{}_{}_{}'.format(c.id, year, m['id'])
                if key in expenses:
                    columns.append({
                        'year': year,
                        'month': m['id'],
                        'expense': expenses[key]
                    })
                    expense_columns.append(float(expenses[key]))
                    contractors_total = contractors_total + float(expenses[key])
                else:
                    date = datetime.datetime.strptime('{}-{}-{}'.format(1, m['id'], year), '%d-%m-%Y').date()
                    start_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                                         c.contractor_start_date.month,
                                                                                         c.contractor_start_date.year),
                                                                       '%d-%m-%Y').date()
                    if start_month_first_day <= date:
                        expense = float(c.contractor_hourly_salary) * float(c.contractor_expected_weekly_hours) * 4
                    else:
                        expense = 0
                    columns.append({
                        'year': year,
                        'month': m['id'],
                        'expense': expense
                    })
                    contractors_total = contractors_total + expense
                    expense_columns.append(expense)
            columns.append(contractors_total)
            rows.append(columns)
            exp.append(expense_columns)

        a = np.array(exp)
        monthly_total = np.sum(a, axis=0, dtype=float)
        monthly_total_items = []
        for idx, mt in enumerate(monthly_total):
            monthly_total_items.append({
                'year': year,
                'month': idx + 1,
                'total_expense': mt
            })
        total = 0
        for item in monthly_total:
            total = total + item
        context = {
            **self.admin_site.each_context(request),
            'title': "Contractors Salary Report",
            'subtitle': None,
            'has_add_permission': self.has_add_permission(request),
            **(extra_context or {}),

            # page specific
            'contractors': contractors,
            'months': months,
            'rows': rows,
            'total_row': monthly_total_items,
            'total': total,
            'contractor_exists': True
        }
        request.current_app = self.admin_site.name
        return TemplateResponse(request, self.change_list_template, context)


class EmployeeMonthlyExpenseAdmin(admin.ModelAdmin):
    change_list_template = 'admin/employee_expense_page.html'

    def has_add_permission(self, request, obj=None):
        return False

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [path("edit", self.admin_site.admin_view(employee_monthly_expense_edit_view))]

        return my_urls + urls

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        """
        The 'change list' admin view for this model.
        """
        if not self.has_view_or_change_permission(request):
            raise PermissionDenied

        previously_updated_expenses = EmployeeMonthlyExpense.objects.all()
        expenses = dict()
        for expense in previously_updated_expenses:
            key = '{}_{}_{}'.format(expense.employee.id, expense.year, expense.month)
            expenses[key] = expense.expense

        employees = Employee.objects.all()
        if len(employees) == 0:
            context = {
                **self.admin_site.each_context(request),
                'title': "Employees Report",
                'subtitle': None,
                'has_add_permission': self.has_add_permission(request),
                **(extra_context or {}),
                # page specific
                'employee_exists': False
            }
            request.current_app = self.admin_site.name
            return TemplateResponse(request, self.change_list_template, context)
        months = get_months()
        year = get_current_year()
        exp = []
        rows = []
        for c in employees:
            columns = [{'id': c.id, 'name': c.employee_name}]
            employees_total = 0
            expense_columns = []
            for m in months:
                key = '{}_{}_{}'.format(c.id, year, m['id'])
                if key in expenses:
                    columns.append({
                        'year': year,
                        'month': m['id'],
                        'expense': expenses[key]
                    })
                    expense_columns.append(float(expenses[key]))
                    employees_total = employees_total + float(expenses[key])
                else:
                    date = datetime.datetime.strptime('{}-{}-{}'.format(1, m['id'], year), '%d-%m-%Y').date()
                    start_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                                         c.employee_start_date.month,
                                                                                         c.employee_start_date.year),
                                                                       '%d-%m-%Y').date()
                    if start_month_first_day <= date:
                        if c.payment_structure == 'W':
                            expense = float(c.employee_monthly_salary) * 4
                        elif c.payment_structure == 'BM':
                            expense = float(c.employee_monthly_salary) * 2
                        else:
                            expense = float(c.employee_monthly_salary)
                    else:
                        expense = 0
                    columns.append({
                        'year': year,
                        'month': m['id'],
                        'expense': expense
                    })
                    employees_total = employees_total + expense
                    expense_columns.append(expense)
            columns.append(employees_total)
            rows.append(columns)
            exp.append(expense_columns)

        a = np.array(exp)
        monthly_total = np.sum(a, axis=0, dtype=float)
        monthly_total_items = []
        for idx, mt in enumerate(monthly_total):
            monthly_total_items.append({
                'year': year,
                'month': idx + 1,
                'total_expense': mt
            })
        total = 0
        for item in monthly_total:
            total = total + item
        context = {
            **self.admin_site.each_context(request),
            'title': "Employees Report",
            'subtitle': None,
            'has_add_permission': self.has_add_permission(request),
            **(extra_context or {}),

            # page specific
            'employees': employees,
            'months': months,
            'rows': rows,
            'total_row': monthly_total_items,
            'total': total,
            'employee_exists': True
        }
        request.current_app = self.admin_site.name
        return TemplateResponse(request, self.change_list_template, context)


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

def get_month_pipeline(pipeline, year, month):
    date = datetime.datetime.strptime('{}-{}-{}'.format(1, month, year), '%d-%m-%Y').date()
    start_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_first_payment.month,
                                                                         pipeline.expected_date_of_first_payment.year),
                                                       '%d-%m-%Y').date()
    # if pipeline.recurring_payment == 'Y':
    #     last_payment_date = pipeline.date_of_last_payment if pipeline.date_of_last_payment is not None \
    #         else datetime.datetime.strptime('{}-{}-{}'.format(1, month, year), '%d-%m-%Y').date()

    #     if pipeline.expense_frequency == 'Q':
    #         if start_month_first_day <= date <= last_payment_date:
    #             diff = month - pipeline.expected_date_of_first_payment.month
    #             if diff % 3 == 0:
    #                 actual_expense = float(pipeline.expense_payment_amount)
    #             else:
    #                 actual_expense = 0
    #         else:
    #             actual_expense = 0
    #     else:
    #         if start_month_first_day <= date <= last_payment_date:
    #             actual_expense = pipeline.get_monthly_expense()
    #         else:
    #             actual_expense = 0
    # else:
    
    recurring_months = pipeline.expected_date_of_first_payment.month + int(pipeline.no_of_payments) -1
    expected_date_of_last_payment_month =  recurring_months % 12
    expected_date_of_last_payment_year = pipeline.expected_date_of_first_payment.year if recurring_months <= 12 else pipeline.expected_date_of_first_payment.year + 1
    end_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         expected_date_of_last_payment_month,
                                                                         expected_date_of_last_payment_year),
                                                       '%d-%m-%Y').date()

    if start_month_first_day <= date <= end_month_first_day:
        actual_expense = float(pipeline.estimated_payment_amount)
    else:
        actual_expense = 0

    return float(actual_expense)



class ExpenseMonthlyExpenseAdmin(admin.ModelAdmin):
    change_list_template = 'admin/expense_expense_page.html'

    def has_add_permission(self, request, obj=None):
        return False

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [path("edit", self.admin_site.admin_view(type_total_expense_edit_view))]

        return my_urls + urls

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        """
        The 'change list' admin view for this model.
        """
        if not self.has_view_or_change_permission(request):
            raise PermissionDenied

        months = get_months()
        year = get_current_year()

        grouped_expense = {}
        type_total_expenses = {}
        monthly_total_expenses = {}
        total = 0
        for m in months:
            monthly_total_expenses[m['id']] = 0

        #for item in Expense.EXPENSE_TYPE:
        for item in ExpenseType.objects.values_list('expense_name'):    
            type_total_expenses[item[0]] = 0
            m_dict = {}
            for m in months:
                m_dict[m['id']] = 0
            grouped_expense[item[0]] = {
                year: m_dict
            }

        previously_updated_expenses = TypeTotalExpense.objects.all()

        updated_expenses = dict()
        for expense_r in previously_updated_expenses:
            key = '{}_{}_{}'.format(expense_r.expense_type, expense_r.year, expense_r.month)
            updated_expenses[key] = float(expense_r.expense)

        expenses_list = Expense.objects.all()

        # if len(expenses_list) == 0:
        #     context = {
        #         **self.admin_site.each_context(request),
        #         'title': "Expenses Report",
        #         'subtitle': None,
        #         'has_add_permission': self.has_add_permission(request),
        #         **(extra_context or {}),
        #         # page specific
        #         'employee_exists': False
        #     }
        #     request.current_app = self.admin_site.name
        #     return TemplateResponse(request, self.change_list_template, context)

        for e in expenses_list:
            for m in months:
                ex = get_month_expense(e, year, m['id'])
                #grouped_expense[e.expense_type][year][m['id']] = grouped_expense[e.expense_type][year][m['id']] + ex
                grouped_expense[e.expense_type.expense_name][year][m['id']] = grouped_expense[e.expense_type.expense_name][year][m['id']] + ex

        #for expense_type in Expense.EXPENSE_TYPE:
        for expense_type in ExpenseType.objects.values_list('expense_name'):
            expense_type_name = expense_type[0]
            for m in months:
                key = '{}_{}_{}'.format(expense_type_name, year, m['id'])
                if key in updated_expenses:
                    grouped_expense[expense_type_name][year][m['id']] = updated_expenses[key]

        for ex_type, value in grouped_expense.items():
            for year, value2 in value.items():
                for month, expense_value in value2.items():
                    monthly_total_expenses[month] = monthly_total_expenses[month] + expense_value
                    type_total_expenses[ex_type] = type_total_expenses[ex_type] + expense_value
                    total = total + expense_value

        context = {
            **self.admin_site.each_context(request),
            'title': "Expenses Report",
            'subtitle': None,
            'has_add_permission': self.has_add_permission(request),
            **(extra_context or {}),

            # page specific

            'months': months,
            'total': total,
            'employee_exists': True,
            'grouped_expenses': grouped_expense,
            'monthly_total_expenses': monthly_total_expenses,
            'type_total_expenses': type_total_expenses,
            'yr': year
        }
        request.current_app = self.admin_site.name
        return TemplateResponse(request, self.change_list_template, context)


class InvoiceMonthlyAdmin(admin.ModelAdmin):
    change_list_template = 'admin/invoice_expense_page.html'

    def has_add_permission(self, request, obj=None):
        return False

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [path("edit", self.admin_site.admin_view(employee_monthly_expense_edit_view))]

        return my_urls + urls

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        """
        The 'change list' admin view for this model.
        """
        if not self.has_view_or_change_permission(request):
            raise PermissionDenied

        invoices = Invoice.objects.all().order_by('-invoice_date')
        if len(invoices) == 0:
            context = {
                **self.admin_site.each_context(request),
                'title': "Invoices Report",
                'subtitle': None,
                'has_add_permission': self.has_add_permission(request),
                **(extra_context or {}),
                # page specific
                'invoice_exists': False
            }
            request.current_app = self.admin_site.name
            return TemplateResponse(request, self.change_list_template, context)

        context = {
            **self.admin_site.each_context(request),
            'title': "Invoices Report",
            'subtitle': None,
            'has_add_permission': self.has_add_permission(request),
            **(extra_context or {}),

            # page specific
            'invoices': invoices,
            'invoice_exists': True
        }
        request.current_app = self.admin_site.name
        return TemplateResponse(request, self.change_list_template, context)


class PipelineMonthlyExpenseAdmin(admin.ModelAdmin):
    change_list_template = 'admin/pipeline_expense_page.html'

    def has_add_permission(self, request, obj=None):
        return False

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [path("edit", self.admin_site.admin_view(type_total_expense_edit_view))]

        return my_urls + urls

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        """
        The 'change list' admin view for this model.
        """
        if not self.has_view_or_change_permission(request):
            raise PermissionDenied

        months = get_months()
        year = get_current_year()

        grouped_pipeline = {}
        type_total_pipelines = {}
        monthly_total_pipelines = {}
        total = 0
        for m in months:
            monthly_total_pipelines[m['id']] = 0

        for item in Client.objects.values_list('client_name'):    
            type_total_pipelines[item[0]] = 0
            m_dict = {}
            for m in months:
                m_dict[m['id']] = 0
            grouped_pipeline[item[0]] = {
                year: m_dict
            }

        pipelines_list = Pipeline.objects.all()
        for p in pipelines_list:
            for m in months:
                ex = get_month_pipeline(p, year, m['id'])
                grouped_pipeline[p.client.client_name][year][m['id']] = grouped_pipeline[p.client.client_name][year][m['id']] + ex

        
        for ex_type, value in grouped_pipeline.items():
            for year, value2 in value.items():
                for month, expense_value in value2.items():
                    monthly_total_pipelines[month] = monthly_total_pipelines[month] + expense_value
                    type_total_pipelines[ex_type] = type_total_pipelines[ex_type] + expense_value
                    total = total + expense_value

        context = {
            **self.admin_site.each_context(request),
            'title': "Pipelines Report",
            'subtitle': None,
            'has_add_permission': self.has_add_permission(request),
            **(extra_context or {}),

            # page specific

            'months': months,
            'total': total,
            'employee_exists': True,
            'grouped_pipelines': grouped_pipeline,
            'monthly_total_pipelines': monthly_total_pipelines,
            'type_total_pipelines': type_total_pipelines,
            'yr': year
        }
        request.current_app = self.admin_site.name
        return TemplateResponse(request, self.change_list_template, context)


# admin.site.register(ContractorMonthlyExpense)
admin.site.register(ContractorMonthlyExpenseReport, ContractorMonthlyExpenseAdmin)

# admin.site.register(EmployeeMonthlyExpense)
admin.site.register(EmployeeMonthlyExpenseReport, EmployeeMonthlyExpenseAdmin)

admin.site.register(TypeTotalExpenseReport, ExpenseMonthlyExpenseAdmin)

admin.site.register(InvoiceMonthlyExpenseReport, InvoiceMonthlyAdmin)

admin.site.register(PipelineMonthlyExpenseReport, PipelineMonthlyExpenseAdmin)
