import datetime
import numpy as np
import matplotlib.pyplot as plt

from django.contrib import admin
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from django.template.response import TemplateResponse
from django.urls import path
from django.contrib.auth.admin import csrf_protect_m

from reports.custom_admin_views.contractor_expense_views import contractor_monthly_expense_edit_view, \
    type_total_expense_edit_view_alt
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
from reports.models import IncomeForecastReport
from tools.models import Invoice

from reports.models import PipelineMonthlyExpenseReport
from tools.models import Pipeline
from tools.models import Client

from reports.models import MonthlyBudgetTrackerReport
from reports.models import MonthlyBudgetTrackerGraph


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


def get_initial_monthly_amount():
    months = get_months()
    m_dict = {}
    for m in months:
        m_dict[m['id']] = 0.0
    return m_dict


def get_current_year():
    return datetime.datetime.now().year


def legend_without_duplicate_labels(figure):
    handles, labels = plt.gca().get_legend_handles_labels()
    by_label = dict(zip(labels, handles))
    figure.legend(by_label.values(), by_label.keys(), loc='upper left')


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

    if pipeline.expected_date_of_second_payment is not None:
        second_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_second_payment.month,
                                                                         pipeline.expected_date_of_second_payment.year),
                                                       '%d-%m-%Y').date()
    else:
        second_month_first_day = ''

    if pipeline.expected_date_of_third_payment is not None:    
        third_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_third_payment.month,
                                                                         pipeline.expected_date_of_third_payment.year),
                                                       '%d-%m-%Y').date()
    else:
        third_month_first_day = ''
    
    if pipeline.expected_date_of_forth_payment is not None:    
        forth_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_forth_payment.month,
                                                                         pipeline.expected_date_of_forth_payment.year),
                                                       '%d-%m-%Y').date()
    else:
       forth_month_first_day = ''
       
    if pipeline.expected_date_of_fifth_payment is not None:    
        fifth_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_fifth_payment.month,
                                                                         pipeline.expected_date_of_fifth_payment.year),
                                                       '%d-%m-%Y').date()
    else:
        fifth_month_first_day = ''

    if pipeline.expected_date_of_sixth_payment is not None:
        sixth_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_sixth_payment.month,
                                                                         pipeline.expected_date_of_sixth_payment.year),
                                                       '%d-%m-%Y').date()
    else:
        sixth_month_first_day = ''   
    
    if pipeline.expected_date_of_seventh_payment is not None:    
        seventh_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_seventh_payment.month,
                                                                         pipeline.expected_date_of_seventh_payment.year),
                                                       '%d-%m-%Y').date()
    else:
        seventh_month_first_day = ''

    if pipeline.expected_date_of_eighth_payment is not None: 
        eight_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_eighth_payment.month,
                                                                         pipeline.expected_date_of_eighth_payment.year),
                                                       '%d-%m-%Y').date()
    else:
        eight_month_first_day = ''

    if pipeline.expected_date_of_nineth_payment is not None:    
        nineth_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_nineth_payment.month,
                                                                         pipeline.expected_date_of_nineth_payment.year),
                                                       '%d-%m-%Y').date()
    else:
        nineth_month_first_day = ''

    if pipeline.expected_date_of_tenth_payment is not None:     
        tenth_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_tenth_payment.month,
                                                                         pipeline.expected_date_of_tenth_payment.year),
                                                       '%d-%m-%Y').date()
    else:
        tenth_month_first_day = ''
        
    if pipeline.expected_date_of_eleventh_payment is not None:       
        eleventh_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_eleventh_payment.month,
                                                                         pipeline.expected_date_of_eleventh_payment.year),
                                                       '%d-%m-%Y').date()
    else:
        eleventh_month_first_day = ''

    if pipeline.expected_date_of_twelfth_payment is not None:     
        twelfth_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         pipeline.expected_date_of_twelfth_payment.month,
                                                                         pipeline.expected_date_of_twelfth_payment.year),
                                                       '%d-%m-%Y').date()
    else:
        twelfth_month_first_day = ''

    # recurring_months = pipeline.expected_date_of_first_payment.month + int(pipeline.no_of_payments) -1
    # expected_date_of_last_payment_month =  recurring_months % 12
    # expected_date_of_last_payment_year = pipeline.expected_date_of_first_payment.year if recurring_months <= 12 else pipeline.expected_date_of_first_payment.year + 1
    # end_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
    #                                                                      expected_date_of_last_payment_month,
    #                                                                      expected_date_of_last_payment_year),
    #                                                    '%d-%m-%Y').date()

    #if start_month_first_day <= date <= end_month_first_day:
    if start_month_first_day == date or \
        second_month_first_day == date or \
        third_month_first_day == date or \
        forth_month_first_day == date or \
        fifth_month_first_day == date or \
        sixth_month_first_day == date or \
        seventh_month_first_day == date or \
        eight_month_first_day == date or \
        nineth_month_first_day == date or \
        tenth_month_first_day == date or \
        eleventh_month_first_day == date or \
        twelfth_month_first_day == date:
        actual_expense = float(pipeline.estimated_payment_amount)
    else:
        actual_expense = 0

    return float(actual_expense)


def get_month_invoice(invoice, year, month):
    date = datetime.datetime.strptime('{}-{}-{}'.format(1, month, year), '%d-%m-%Y').date()
    start_month_first_day = datetime.datetime.strptime('{}-{}-{}'.format(1,
                                                                         invoice.expected_date_of_payment.month,
                                                                         invoice.expected_date_of_payment.year),
                                                       '%d-%m-%Y').date()

    if start_month_first_day == date:
        actual_expense = float(invoice.invoice_amount)
    else:
        actual_expense = 0

    return float(actual_expense)


def get_expense_calc():
    months = get_months()
    year = get_current_year()

    grouped_expense = {}
    type_total_expenses = {}
    monthly_total_expenses = {}
    total = 0
    for m in months:
        monthly_total_expenses[m['id']] = 0

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
    for e in expenses_list:
        for m in months:
            ex = get_month_expense(e, year, m['id'])
            grouped_expense[e.expense_type.expense_name][year][m['id']] = grouped_expense[e.expense_type.expense_name][year][m['id']] + ex

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

    return year, months, grouped_expense, type_total_expenses, monthly_total_expenses, total


def get_expense_calc_alt():
    months = get_months()
    year = get_current_year()

    grouped_expense = {}
    type_total_expenses = {}
    monthly_total_expenses = {}
    total = 0
    for m in months:
        monthly_total_expenses[m['id']] = 0

    expense_types = ExpenseType.objects.all()
    expense_type_map = {}
    for e in expense_types:
        expense_type_map[e.expense_name] = e.id

    for e in expense_types:
        type_total_expenses[e.expense_name] = 0
        m_dict = {}
        for m in months:
            m_dict[m['id']] = {'expense': 0, 'updated': False}
        grouped_expense[e.expense_name] = {
            year: m_dict
        }
    previously_updated_expenses = TypeTotalExpense.objects.all()
    updated_expenses = dict()
    for expense_r in previously_updated_expenses:
        key = '{}_{}_{}'.format(expense_r.expense_type.id, expense_r.year, expense_r.month)
        updated_expenses[key] = float(expense_r.expense)

    expenses_list = Expense.objects.all()
    for e in expenses_list:
        for m in months:
            ex = get_month_expense(e, year, m['id'])
            grouped_expense[e.expense_type.expense_name][year][m['id']]['expense'] = grouped_expense[e.expense_type.expense_name][year][m['id']]['expense'] + ex

    for expense_type in expense_types:
        for m in months:
            key = '{}_{}_{}'.format(expense_type.id, year, m['id'])
            if key in updated_expenses:
                grouped_expense[expense_type.expense_name][year][m['id']] = {'expense': updated_expenses[key], 'updated': True}

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

    return year, months, type_total_expenses, monthly_total_expenses, total, rows


def get_employee_calc():
    months = get_months()
    year = get_current_year()
    exp = []
    rows = []
    monthly_total_items = []
    total = 0
    employees = Employee.objects.all().order_by('-created_at')

    if len(employees) == 0:
        pass
    else:  
        previously_updated_expenses = EmployeeMonthlyExpense.objects.all()
        expenses = dict()
        for expense in previously_updated_expenses:
            key = '{}_{}_{}'.format(expense.employee.id, expense.year, expense.month)
            expenses[key] = expense.expense

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
                        'expense': expenses[key],
                        'updated': True
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
                        'expense': expense,
                        'updated': False
                    })
                    employees_total = employees_total + expense
                    expense_columns.append(expense)
            columns.append(employees_total)
            rows.append(columns)
            exp.append(expense_columns)

        a = np.array(exp)
        monthly_total = np.sum(a, axis=0, dtype=float)
        
        for idx, mt in enumerate(monthly_total):
            monthly_total_items.append({
                'year': year,
                'month': idx + 1,
                'total_expense': mt
            })
        
        for item in monthly_total:
            total = total + item

    return year, months, employees, rows, monthly_total_items, total


def get_contractor_calc():
    months = get_months()
    year = get_current_year()
    exp = []
    rows = []
    monthly_total_items = []
    total = 0
    contractors = Contractor.objects.all()

    if len(contractors) == 0:
        pass
    else:    
        previously_updated_expenses = ContractorMonthlyExpense.objects.all()
        expenses = dict()
        for expense in previously_updated_expenses:
            key = '{}_{}_{}'.format(expense.contractor.id, expense.year, expense.month)
            expenses[key] = expense.expense

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
                        'expense': expenses[key],
                        'updated': True
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
                        'expense': expense,
                        'updated': False
                    })
                    contractors_total = contractors_total + expense
                    expense_columns.append(expense)
            columns.append(contractors_total)
            rows.append(columns)
            exp.append(expense_columns)

        a = np.array(exp)
        monthly_total = np.sum(a, axis=0, dtype=float)
        for idx, mt in enumerate(monthly_total):
            monthly_total_items.append({
                'year': year,
                'month': idx + 1,
                'total_expense': mt
            })
        
        for item in monthly_total:
            total = total + item

    return year, months, contractors, rows, monthly_total_items, total


def get_monthly_pipeline_amount(weighted):
    year = get_current_year()
    q = (Q(expected_date_of_first_payment__year=year)
         | Q(expected_date_of_second_payment__year=year)
         | Q(expected_date_of_third_payment__year=year)
         | Q(expected_date_of_forth_payment__year=year)
         | Q(expected_date_of_fifth_payment__year=year)
         | Q(expected_date_of_sixth_payment__year=year)
         | Q(expected_date_of_seventh_payment__year=year)
         | Q(expected_date_of_eighth_payment__year=year)
         | Q(expected_date_of_nineth_payment__year=year)
         | Q(expected_date_of_tenth_payment__year=year)
         | Q(expected_date_of_eleventh_payment__year=year)
         | Q(expected_date_of_twelfth_payment__year=year)
         )
    pipelines = Pipeline.objects.filter(q)
    total_monthly_amount = get_initial_monthly_amount()
    for pipeline in pipelines:
        monthly_amount = get_initial_monthly_amount()
        if weighted:
            total_amount = float(pipeline.total_value_in_forecast) * (float(pipeline.confidence) / 100)
        else:
            total_amount = float(pipeline.total_value_in_forecast)
        single_payment_amount = total_amount / float(pipeline.no_of_payments)
        if pipeline.expected_date_of_first_payment is not None:
            monthly_amount[pipeline.expected_date_of_first_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_first_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_second_payment is not None:
            monthly_amount[pipeline.expected_date_of_second_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_second_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_third_payment is not None:
            monthly_amount[pipeline.expected_date_of_third_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_third_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_forth_payment is not None:
            monthly_amount[pipeline.expected_date_of_forth_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_forth_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_fifth_payment is not None:
            monthly_amount[pipeline.expected_date_of_fifth_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_fifth_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_sixth_payment is not None:
            monthly_amount[pipeline.expected_date_of_sixth_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_sixth_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_seventh_payment is not None:
            monthly_amount[pipeline.expected_date_of_seventh_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_seventh_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_eighth_payment is not None:
            monthly_amount[pipeline.expected_date_of_eighth_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_eighth_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_nineth_payment is not None:
            monthly_amount[pipeline.expected_date_of_nineth_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_nineth_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_tenth_payment is not None:
            monthly_amount[pipeline.expected_date_of_tenth_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_tenth_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_eleventh_payment is not None:
            monthly_amount[pipeline.expected_date_of_eleventh_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_eleventh_payment.month] + single_payment_amount)
        if pipeline.expected_date_of_twelfth_payment is not None:
            monthly_amount[pipeline.expected_date_of_twelfth_payment.month] = (
                    monthly_amount[pipeline.expected_date_of_twelfth_payment.month] + single_payment_amount)
        for key, value in monthly_amount.items():
            total_monthly_amount[key] = total_monthly_amount[key] + value
    return total_monthly_amount


def get_monthly_budget_calc():
    months = get_months()
    year = get_current_year()

    ########Income########

    m_dict = {}
    for m in months:
        m_dict[m['id']] = 0
    grouped_invoice = {year:m_dict}
    type_total_invoices = 0

    invoices_list = Invoice.objects.all()
    for i in invoices_list:
        for m in months:
            inv = get_month_invoice(i, year, m['id'])
            grouped_invoice[year][m['id']] = grouped_invoice[year][m['id']] + inv

    for year, value in grouped_invoice.items():
        for month, invoice_value in value.items():
            type_total_invoices = type_total_invoices + invoice_value

    #######Expense################    

    year_expn, months_expn, grouped_expense, type_total_expenses, monthly_total_exps, total_exps = get_expense_calc() 

    ######Employee Expense#########

    year_emp, months_emp, employees, rows_emp, monthly_total_emps_tmp, total_emp_exps = get_employee_calc()

    monthly_total_emps = {}
    for m in months:
        monthly_total_emps[m['id']] = 0
    for mtet in monthly_total_emps_tmp:
        monthly_total_emps[mtet['month']] = mtet['total_expense']

    ######Contractor Expense#########
        
    year_con, months_con, contractors, rows_con, monthly_total_cons_tmp, total_con_exps = get_contractor_calc()

    monthly_total_cons = {}
    for m in months:
        monthly_total_cons[m['id']] = 0
    for mtct in monthly_total_cons_tmp:
        monthly_total_cons[mtct['month']] = mtct['total_expense']

    ########Total Expense#########

    monthly_total_expenses = {}
    total_expenses = 0

    for m in months:
        monthly_total_expenses[m['id']] = monthly_total_exps[m['id']] + monthly_total_emps[m['id']] + monthly_total_cons[m['id']]

    total_expenses =  total_exps + total_emp_exps + total_con_exps

    #########Net Income############
    m_dict = {}
    for m in months:
        m_dict[m['id']] = 0
    grouped_netincome = {year:m_dict}
    type_total_netincome = 0

    for m in months:
        grouped_netincome[year][m['id']] = grouped_invoice[year][m['id']] - monthly_total_expenses[m['id']]


    type_total_netincome = type_total_invoices - total_expenses

    #############Starting Monthly Bal###############

    m_dict = {}
    for m in months:
        m_dict[m['id']] = 0
    grouped_strtmonthlybal = {year:m_dict}
    type_total_strtmonthlybal = 0

    for m in months:
        if m['id'] > 1:
            grouped_strtmonthlybal[year][m['id']] = grouped_strtmonthlybal[year][m['id'] - 1] + grouped_netincome[year][m['id'] - 1] 
        else:
            grouped_strtmonthlybal[year][m['id']] = 0

    for year, value in grouped_strtmonthlybal.items():
        for month, strtmonthlybal_value in value.items():
            type_total_strtmonthlybal = type_total_strtmonthlybal + strtmonthlybal_value        

    ########################

    return months, grouped_invoice, type_total_invoices, monthly_total_expenses, total_expenses, grouped_netincome, type_total_netincome, grouped_strtmonthlybal, type_total_strtmonthlybal


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

        year, months, contractors, rows, monthly_total_items, total = get_contractor_calc()   

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
        else:
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

        year, months, employees, rows, monthly_total_items, total = get_employee_calc()   
        
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
        else:    
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

class ExpenseMonthlyExpenseAdmin(admin.ModelAdmin):
    change_list_template = 'admin/expense_expense_page.html'

    def has_add_permission(self, request, obj=None):
        return False

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [path("edit", self.admin_site.admin_view(type_total_expense_edit_view_alt))]

        return my_urls + urls

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        """
        The 'change list' admin view for this model.
        """
        if not self.has_view_or_change_permission(request):
            raise PermissionDenied

        year, months, grouped_expense, type_total_expenses, monthly_total_expenses, total = get_expense_calc() 

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


class IncomeForecastAdmin(admin.ModelAdmin):
    change_list_template = 'admin/income_forecast_page.html'

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

        grouped_invoice = {}
        type_total_invoices = {}
        monthly_total_invoices = {}
        total = 0
        for m in months:
            monthly_total_invoices[m['id']] = 0

        for item in Client.objects.values_list('client_name'):    
            type_total_invoices[item[0]] = 0
            m_dict = {}
            for m in months:
                m_dict[m['id']] = 0
            grouped_invoice[item[0]] = {
                year: m_dict
            }

        invoices_list = Invoice.objects.all()
        for i in invoices_list:
            for m in months:
                ex = get_month_invoice(i, year, m['id'])
                grouped_invoice[i.client.client_name][year][m['id']] = grouped_invoice[i.client.client_name][year][m['id']] + ex

        
        for ex_type, value in grouped_invoice.items():
            for year, value2 in value.items():
                for month, expense_value in value2.items():
                    monthly_total_invoices[month] = monthly_total_invoices[month] + expense_value
                    type_total_invoices[ex_type] = type_total_invoices[ex_type] + expense_value
                    total = total + expense_value

        context = {
            **self.admin_site.each_context(request),
            'title': "Income Forecast Report",
            'subtitle': None,
            'has_add_permission': self.has_add_permission(request),
            **(extra_context or {}),

            # page specific

            'months': months,
            'total': total,
            'employee_exists': True,
            'grouped_invoices': grouped_invoice,
            'monthly_total_invoices': monthly_total_invoices,
            'type_total_invoices': type_total_invoices,
            'yr': year
        }
        request.current_app = self.admin_site.name
        return TemplateResponse(request, self.change_list_template, context)


class MonthlyBudgetTrackerAdmin(admin.ModelAdmin):
    change_list_template = 'admin/monthly_budget_tracker_page.html'

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
  
        months, grouped_invoice, type_total_invoices, monthly_total_expenses, total_expenses, grouped_netincome, type_total_netincome, grouped_strtmonthlybal, type_total_strtmonthlybal = get_monthly_budget_calc() 
        
        context = {
            **self.admin_site.each_context(request),
            'title': "Monthly Budget Tracker Report",
            'subtitle': None,
            'has_add_permission': self.has_add_permission(request),
            **(extra_context or {}),
            # page specific
            'months': months,
            'grouped_invoices': grouped_invoice,
            'type_total_invoices': type_total_invoices,
            'monthly_total_expenses': monthly_total_expenses,
            'total_expenses': total_expenses,
            'grouped_netincomes': grouped_netincome,
            'type_total_netincome': type_total_netincome,
            'grouped_strtmonthlybals': grouped_strtmonthlybal,
            'type_total_strtmonthlybal': type_total_strtmonthlybal
        }
        request.current_app = self.admin_site.name
        return TemplateResponse(request, self.change_list_template, context)


class MonthlyBudgetTrackerAdminGraph(admin.ModelAdmin):
    change_list_template = 'admin/monthly_budget_graph_page.html'

    def has_add_permission(self, request, obj=None):
        return False

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        """
        The 'change list' admin view for this model.
        """
        if not self.has_view_or_change_permission(request):
            raise PermissionDenied

        income = []
        expenses = [] 
        profit = []
        show_months = [1,2,3,4,5,6,7,8,9,10,11,12]

        months, grouped_invoice, type_total_invoices, monthly_total_expenses, total_expenses, grouped_netincome, type_total_netincome, grouped_strtmonthlybal, type_total_strtmonthlybal = get_monthly_budget_calc()

        for month, monthly_invoices in  grouped_invoice.items():
            for month, invoice in  monthly_invoices.items():
                income.append(invoice)
        for month, expense in  monthly_total_expenses.items():
            expenses.append(expense)
        for month, monthly_netincomes in  grouped_netincome.items():
            for month, netincome in  monthly_netincomes.items():
                profit.append(netincome)
        
        # plt.rcParams["figure.figsize"] = [9, 4]
        # plt.rcParams["figure.autolayout"] = True

        # plt.plot(show_months, income, '-g', label='Income')
        # plt.plot(show_months, expenses, '-r', label='Expenses')
        # plt.plot(show_months, profit, '-b', label='Profit')
        

        # plt.title('Account Balance by Month')
        # plt.xlabel("Month")
        # plt.ylabel("Amount")
        # legend_without_duplicate_labels(plt)

        # fig = plt.gcf()
        # buf = io.BytesIO()
        # fig.savefig(buf,format='png')
        # buf.seek(0)
        # string = base64.b64encode(buf.read())
        # uri =  urllib.parse.quote(string)

        context = {
            **self.admin_site.each_context(request),
            'title': "Budget Graph",
            'subtitle': None,
            'has_add_permission': self.has_add_permission(request),
            **(extra_context or {}),
            #'chart_image': uri,
            'income': income,
            'expenses': expenses,
            'profit': profit,
            
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

admin.site.register(IncomeForecastReport, IncomeForecastAdmin)

admin.site.register(MonthlyBudgetTrackerReport, MonthlyBudgetTrackerAdmin)

admin.site.register(MonthlyBudgetTrackerGraph, MonthlyBudgetTrackerAdminGraph)
