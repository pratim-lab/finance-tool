from django.contrib import admin
from django.contrib.auth.admin import csrf_protect_m
from django.shortcuts import redirect
from django.urls import path
from django.utils.html import format_html

from .admin_views.client_views import ClientCreateAdminAPIView, ClientRetrieveUpdateDestroyAdminAPIView, ClientListView
from .forms.client_forms import ClientAddForm
from .models import Client, Project, Employee, Contractor, ExpenseType, Expense, Invoice, Pipeline
# from dynamic_admin_forms.admin import DynamicModelAdminMixin


class ClientAdmin(admin.ModelAdmin):
    change_list_template = 'admin/client/custom_change_list.html'
    list_display = ('action', 'client_name', 'client_type', 'billing_structure', 'created_at')
    list_display_links = ('client_name',)

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            path("api/add", self.admin_site.admin_view(ClientCreateAdminAPIView.as_view())),
            path("api/list", self.admin_site.admin_view(ClientListView.as_view())),
            path("api/<pk>", self.admin_site.admin_view(ClientRetrieveUpdateDestroyAdminAPIView.as_view())),

        ]
        return my_urls + urls

    def action(self, obj):
        return format_html(
            '<div class="btn-group dropend client-id-' + str(obj.id) + '" role="group">'
                '<button type="button" class="btn btn-secondary" data-bs-toggle="dropdown">:</button>'
                '<ul class="dropdown-menu">'
                    '<li>'
                        '<button class="btn btn-client-edit" data-id=' + str(obj.id) + '>Edit</button>'
                    '</li>'
            '       <li>'
                        '<button class="btn btn-client-delete" data-id=' + str(obj.id) + '>Delete</button>'
                    '</li>'
                '</ul>'
            '</div>'
        )
    action.allow_tags = True
    # my_url_field.short_description = 'Action'

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        return super().changelist_view(request, extra_context={"client_add_form": ClientAddForm(), "title": "Clients"})

    class Media:
        js = (
            '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
            'tools/js/client.js',
        )

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('project_name', 'client', 'project_type', 'billing_structure', 'created_at')
    #list_filter = ('client', 'project_type', 'billing_structure')

    class Media:
        js = (
            '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
            'tools/js/project.js',
        )

    def response_add(self, request, obj, post_url_continue=None):
        if obj.project_type == 'A':
            return redirect('/admin/tools/invoice/add')
        else:
            return redirect('/admin/tools/pipeline/add')

    #def response_change(self, request, obj):
    #    if obj.project_type == 'A':
    #        return redirect('/admin/tools/invoice')
    #    else:
    #        return redirect('/admin/tools/pipeline') 

class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_name', 'employee_start_date', 'payment_structure', 'employee_monthly_salary', 'created_at')

    class Media:
        js = (
            '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
            'tools/js/employee.js',
        )

class ContractorAdmin(admin.ModelAdmin):
    list_display = ('contractor_name', 'contractor_start_date', 'contractor_hourly_salary', 'created_at')

    class Media:
        js = (
            '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
            'tools/js/contractor.js',
        )

class ExpenseTypeAdmin(admin.ModelAdmin):
    list_display = ('expense_name', 'created_at')


class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('expense_type', 'recurring_payment', 'expense_payment_amount', 'date_of_first_payment')
    #list_filter = ('recurring_payment')

    class Media:
        js = (
            '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
            'tools/js/expense.js',
        )

class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('project', 'invoice_number', 'created_at')

    class Media:
        js = (
            '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
            'tools/js/invoice.js',
        )

class PipelineAdmin(admin.ModelAdmin):
    list_display = ('estimated_price', 'confidence', 'no_of_payments')

    class Media:
        js = (
            '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
            'tools/js/pipeline.js',
        )

admin.site.register(Client,ClientAdmin)
admin.site.register(Project,ProjectAdmin)
admin.site.register(Employee,EmployeeAdmin)
admin.site.register(Contractor,ContractorAdmin)
admin.site.register(ExpenseType,ExpenseTypeAdmin)
admin.site.register(Expense,ExpenseAdmin)
admin.site.register(Invoice,InvoiceAdmin)
admin.site.register(Pipeline,PipelineAdmin)