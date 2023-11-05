from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path
from djangoproject.admin import custom_admin
from operations.admin_views.expense_views import ExpenseReportAPIView, ExpenseTypeListView, \
    ExpenseTypeCreateAdminAPIView, ExpenseTypeRetrieveUpdateDestroyAdminAPIView
from operations.models import Expense


class ExpenseAdmin(admin.ModelAdmin):

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        urls = [
            path("expense-type/api/add", self.admin_site.admin_view(ExpenseTypeCreateAdminAPIView.as_view())),
            path("expense-type/api/list", self.admin_site.admin_view(ExpenseTypeListView.as_view())),
            path("api/report", self.admin_site.admin_view(ExpenseReportAPIView.as_view())),
            path("report", self.admin_site.admin_view(self.report), name='%s_%s_changelist' % info),
            path("expense-type/api/<pk>", self.admin_site.admin_view(
                ExpenseTypeRetrieveUpdateDestroyAdminAPIView.as_view())),
        ]
        return urls

    def report(self, request):
        context = dict(
            self.admin_site.each_context(request),
            # form=StaffForm(),
        )
        return TemplateResponse(request, 'admin/expense/expense_report.html', context)


custom_admin.register(Expense, ExpenseAdmin)
