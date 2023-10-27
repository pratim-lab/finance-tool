from django.db import models
from tools.models import Contractor as ToolsContractor, Employee as ToolsEmployee


class Contractor(ToolsContractor):
    class Meta:
        proxy = True


class Staff(ToolsEmployee):
    class Meta:
        proxy = True
