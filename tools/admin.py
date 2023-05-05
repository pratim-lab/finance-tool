from django.contrib import admin
from django.shortcuts import redirect

from .models import Client, Project, Employee, Contractor, ExpenseType, Expense, Invoice, Pipeline
#from dynamic_admin_forms.admin import DynamicModelAdminMixin


class ClientAdmin(admin.ModelAdmin):
    list_display = ('client_name', 'client_type', 'billing_structure', 'created_at')
    #list_filter = ('client_type', 'billing_structure')

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