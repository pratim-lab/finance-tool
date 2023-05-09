from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

import tools.models


class ContractorMonthlyExpense(models.Model):
    contractor = models.ForeignKey('tools.Contractor', null=False, on_delete=models.CASCADE)
    year = models.IntegerField(null=False)
    month = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(12)])
    expense = models.DecimalField(null=False, max_digits=10, decimal_places=2)

    def __str__(self):
        return '{} - {} - {}: {}'.format(self.contractor, self.year, self.month, self.expense)


class ContractorMonthlyExpenseReport(ContractorMonthlyExpense):

    class Meta:
        proxy = True
        verbose_name = 'Contractors'
        verbose_name_plural = 'Contractors'


class EmployeeMonthlyExpense(models.Model):
    employee = models.ForeignKey('tools.Employee', null=False, on_delete=models.CASCADE)
    year = models.IntegerField(null=False)
    month = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(12)])
    expense = models.DecimalField(null=False, max_digits=10, decimal_places=2)

    def __str__(self):
        return '{} - {} - {}: {}'.format(self.employee, self.year, self.month, self.expense)


class EmployeeMonthlyExpenseReport(EmployeeMonthlyExpense):

    class Meta:
        proxy = True
        verbose_name = 'Employees'
        verbose_name_plural = 'Employees'


class TypeTotalExpense(models.Model):
    #expense_type = models.CharField(choices=tools.models.Expense.EXPENSE_TYPE, null=False, max_length=30)
    expense_type = models.ForeignKey(tools.models.ExpenseType, on_delete=models.CASCADE)
    year = models.IntegerField(null=False)
    month = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(12)])
    expense = models.DecimalField(null=False, max_digits=10, decimal_places=2)

    def __str__(self):
        return '{} - {} - {}: {}'.format(self.expense_type, self.year, self.month, self.expense)


class TypeTotalExpenseReport(TypeTotalExpense):

    class Meta:
        proxy = True
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'

class InvoiceMonthlyExpense(models.Model):
   
    def __str__(self):
        return ''

class InvoiceMonthlyExpenseReport(InvoiceMonthlyExpense):

    class Meta:
        proxy = True
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'

class PipelineMonthlyExpense(models.Model):
   
    def __str__(self):
        return ''

class PipelineMonthlyExpenseReport(PipelineMonthlyExpense):

    class Meta:
        proxy = True
        verbose_name = 'Pipeline'
        verbose_name_plural = 'Pipelines'

class IncomeForecast(models.Model):
   
    def __str__(self):
        return ''

class IncomeForecastReport(IncomeForecast):

    class Meta:
        proxy = True
        verbose_name = 'Income Forecast'
        verbose_name_plural = 'Income Forecasts'