from tools.models import Contractor as ToolsContractor, Employee as ToolsEmployee, Vendor as ToolsVendor


class Contractor(ToolsContractor):
    class Meta:
        proxy = True


class Staff(ToolsEmployee):
    class Meta:
        proxy = True
        verbose_name_plural = 'Staff'


class Vendor(ToolsVendor):
    class Meta:
        proxy = True
