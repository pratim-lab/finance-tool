from django.db import models
from tools.models import Client as ToolsClient, Pipeline as ToolsPipeline, Project as ToolsProject, Invoice as ToolsInvoice


class Client(ToolsClient):
    class Meta:
        proxy = True


class Pipeline(ToolsPipeline):
    class Meta:
        proxy = True


class Project(ToolsProject):
    class Meta:
        proxy = True


class Invoice(ToolsInvoice):
    class Meta:
        proxy = True