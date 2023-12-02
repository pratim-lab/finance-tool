import datetime

from django.contrib import admin
from django.http import JsonResponse
from django.template.response import TemplateResponse
from django.urls import path

from djangoproject.admin import custom_admin
from operations.models import FinancialForecastGraph
from reports.admin import get_monthly_budget_calc, get_monthly_pipeline_amount


class FinancialForecastGraphAdmin(admin.ModelAdmin):

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        urls = [
            path("api/graph-data", self.admin_site.admin_view(self.graph_data)),
            path("", self.admin_site.admin_view(self.graph_page), name='%s_%s_changelist' % info)
        ]
        return urls

    def graph_page(self, request):
        context = dict(
            self.admin_site.each_context(request),
        )
        context['year'] = datetime.datetime.now().year
        return TemplateResponse(request, 'admin/forecast/forecast_change_list.html', context)

    def graph_data(self, request):
        income_type = request.GET['income_type']
        income = []
        expenses = []
        profit = []
        (months, grouped_invoice, type_total_invoices, monthly_total_expenses, total_expenses, grouped_netincome,
         type_total_netincome, grouped_strtmonthlybal, type_total_strtmonthlybal) = get_monthly_budget_calc()

        for month, monthly_invoices in grouped_invoice.items():
            for month, invoice in monthly_invoices.items():
                income.append(invoice)
        for month, expense in monthly_total_expenses.items():
            expenses.append(expense)
        for month, monthly_netincomes in grouped_netincome.items():
            for month, netincome in monthly_netincomes.items():
                profit.append(netincome)
        if income_type == "weighted" or income_type == "unweighted":
            monthly_pipeline_amount = get_monthly_pipeline_amount(income_type == "weighted")
            for key, value in monthly_pipeline_amount.items():
                income[key - 1] = income[key - 1] + value
        return JsonResponse({
            "income": income,
            "expenses": expenses,
            "profit": profit
        })


custom_admin.register(FinancialForecastGraph, FinancialForecastGraphAdmin)
