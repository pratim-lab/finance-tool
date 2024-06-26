from django.db import models
import json, os

class Client(models.Model):
	
	CLIENT_TYPES = (
		('AC', 'Active Client'),
		('PC', 'Prospective Client'),
	)

	BILLING_STRUCTURE = (
		('R', 'Retainer'),
		('PB', 'Project Based'),
		('MX', 'Mixed'),
	)

	PAYMENT_TERMS = (
		('N07', 'Net 7'),
		('N15', 'Net 15'),
		('N30', 'Net 30'),
		('N45', 'Net 45'),
		('OTR', 'Other'),
	)

	client_name = models.CharField(max_length=255)
	address1 = models.TextField()
	address2 = models.TextField(null=True, blank=True)
	city = models.CharField(max_length=20)
	state = models.CharField(max_length=20)
	country = models.CharField(max_length=20)
	zipcode = models.CharField(max_length=10)
	client_type = models.CharField(max_length=2, choices=CLIENT_TYPES)
	billing_structure = models.CharField(max_length=2, choices=BILLING_STRUCTURE)
	billing_target = models.TextField()
	payment_terms = models.CharField(max_length=50, choices=PAYMENT_TERMS)
	payment_terms_other = models.CharField(max_length=50, null=True, blank=True,help_text='Please enter number of days')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return '{}'.format(self.client_name)

class Project(models.Model):
	
	PROJECT_TYPES = (
		('A', 'Active'),
		('P', 'Pipeline'),
	)

	BILLING_STRUCTURE = (
		('R', 'Retainer'),
		('PB', 'Project Based'),
	)

	client = models.ForeignKey(Client, on_delete=models.CASCADE)
	project_name = models.CharField(max_length=255)
	project_type = models.CharField(max_length=2, choices=PROJECT_TYPES)
	#confidence = models.CharField(max_length=5, null=True, blank=True, help_text='Please assign confidence as %')
	billing_structure = models.CharField(max_length=2, choices=BILLING_STRUCTURE)
	#total_fees = models.CharField(max_length=10, help_text='Please enter fee in USD')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return '{}'.format(self.project_name)

class Employee(models.Model):
	
	PAYMENT_STRUCTURE = (
		('W', 'Weekly'),
		('BM', 'Bi-Monthly'),
		('M', 'Monthly')
	)

	employee_name = models.CharField(max_length=255)
	address1 = models.TextField()
	address2 = models.TextField(null=True, blank=True)
	city = models.CharField(max_length=20)
	state = models.CharField(max_length=20)
	country = models.CharField(max_length=20)
	zipcode = models.CharField(max_length=10)
	employee_start_date = models.DateField()
	payment_structure = models.CharField(max_length=2, choices=PAYMENT_STRUCTURE)
	employee_monthly_salary = models.CharField(max_length=10,help_text='Please enter salary in USD')
	employee_monthly_tax = models.CharField(max_length=10,help_text='Please enter fee as %')
	employee_net_income = models.CharField(max_length=10)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return '{}'.format(self.employee_name)

class Contractor(models.Model):

	contractor_name = models.CharField(max_length=255)
	address1 = models.TextField()
	address2 = models.TextField(null=True, blank=True)
	city = models.CharField(max_length=20)
	state = models.CharField(max_length=20)
	country = models.CharField(max_length=20)
	zipcode = models.CharField(max_length=10)
	contractor_start_date = models.DateField()
	contractor_hourly_salary = models.CharField(max_length=10,help_text='Please enter salary in USD')
	contractor_expected_weekly_hours = models.CharField(max_length=5)
	contractor_estimated_weekly_salary = models.CharField(max_length=10,help_text='in USD')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return '{}'.format(self.contractor_name)

class ExpenseType(models.Model):

	expense_name = models.CharField(max_length=255)
	expense_description = models.TextField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return '{}'.format(self.expense_name)

class Expense(models.Model):

	EXPENSE_TYPE = (
		('Advertising', 'Advertising'),
		('Bank Fees', 'Bank Fees'),
		('Car', 'Car'),
		('Cell Phone', 'Cell Phone'),
		('Client Expense', 'Client Expense'),
		('Computer', 'Computer'),
		('Donation', 'Donation'),
		('Insurance', 'Insurance'),
		('Legal Fees', 'Legal Fees'),
		('Office Expense', 'Office Expense'),
		('Rent', 'Rent'),
		('Recruitment & Training', 'Recruitment & Training'),
		('Subscriptions', 'Subscriptions'),
		('Tax Preparation Files', 'Tax Preparation Files'),
		('Travel', 'Travel'),
		('Utilities', 'Utilities'),
		('Other','Other')
	)

	# with open(os.path.dirname(__file__)+'/json_data/expenses.json') as f:
	# 	expenses_json = json.load(f)
	# 	EXPENSE_TYPE = [(str(expense["name"]), str(expense["name"])) for expense in expenses_json]

	EXPENSE_FREQUENCY = (
		('W', 'Weekly'),
		('BM', 'Bi-Monthly'),
		('M', 'Monthly'),
		('Q', 'Quarterly')
	)

	RECURRING_PAYMENT = (
		('Y', 'Yes'),
		('N', 'No')
	)

	expense_type = models.ForeignKey(ExpenseType, on_delete=models.CASCADE)
	#expense_type = models.CharField(max_length=50, choices=EXPENSE_TYPE)
	expense_type_other = models.CharField(max_length=255, null=True, blank=True)
	recurring_payment = models.CharField(max_length=2, choices=RECURRING_PAYMENT)
	expense_payment_amount = models.CharField(max_length=10,help_text='Please enter amount in USD')
	expense_frequency = models.CharField(max_length=2, choices=EXPENSE_FREQUENCY, null=True, blank=True)
	date_of_first_payment = models.DateField(null=True, blank=True)
	date_of_last_payment = models.DateField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def get_monthly_expense(self):
		if self.recurring_payment == 'N':
			return float(self.expense_payment_amount)
		elif self.expense_frequency == 'W':
			return float(self.expense_payment_amount) * 4
		elif self.expense_frequency == 'BM':
			return float(self.expense_payment_amount) * 2
		elif self.expense_frequency == 'Q':
			return float(self.expense_payment_amount) / 3
		else:
			return float(self.expense_payment_amount)

	def __str__(self):
		return '{}'.format(self.expense_type)

class Invoice(models.Model):

	INVOICE_STATUS = (
		('P', 'Paid'),
		('S', 'Sent'),
		('TBI', 'To Be Invoiced')
	)

	client = models.ForeignKey(Client, on_delete=models.CASCADE)
	project = models.ForeignKey(Project, on_delete=models.CASCADE)
	invoice_date = models.DateField()
	invoice_number = models.CharField(max_length=255)
	invoice_status = models.CharField(max_length=3, choices=INVOICE_STATUS)
	expected_date_of_payment = models.DateField()
	invoice_amount = models.CharField(max_length=10,help_text='Please enter amount in USD')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return '{}'.format(self.invoice_number)

class Pipeline(models.Model):

	NO_OF_PAYMENTS = (
		('1', '1'),
		('2', '2'),
		('3', '3'),
		('4', '4'),
		('5', '5'),
		('6', '6'),
		('7', '7'),
		('8', '8'),
		('9', '9'),
		('10', '10'),
		('11', '11'),
		('12', '12')
	)

	client = models.ForeignKey(Client, on_delete=models.CASCADE)
	project = models.ForeignKey(Project, on_delete=models.CASCADE)
	estimated_price = models.CharField(max_length=10,help_text='Please enter price in USD')
	confidence = models.CharField(max_length=5, help_text='Please assign confidence as %')
	no_of_payments = models.CharField(max_length=2, choices=NO_OF_PAYMENTS)
	expected_date_of_first_payment = models.DateField()
	total_value_in_forecast = models.CharField(max_length=10,help_text='Please enter price in USD')
	estimated_payment_amount = models.CharField(max_length=10,help_text='Please enter amount in USD')

	def __str__(self):
		return '{}'.format(self.estimated_price)