from django.db import models

from reports.models import MonthlyBudgetGraph
from tools.models import (Client as ToolsClient, Pipeline as ToolsPipeline, Project as ToolsProject,
                          Invoice as ToolsInvoice, Expense as ToolsExpense)


class Client(ToolsClient):
    class Meta:
        proxy = True


class Pipeline(ToolsPipeline):
    class Meta:
        proxy = True
        verbose_name_plural = 'Pipeline'


class Project(ToolsProject):
    class Meta:
        proxy = True


class Invoice(ToolsInvoice):
    class Meta:
        proxy = True


class Expense(ToolsExpense):
    class Meta:
        proxy = True
        verbose_name_plural = "Business Expenses"


class FinancialForecastGraph(MonthlyBudgetGraph):
    class Meta:
        proxy = True
        verbose_name = 'Financial Forecast'
        verbose_name_plural = 'Financial Forecast'
