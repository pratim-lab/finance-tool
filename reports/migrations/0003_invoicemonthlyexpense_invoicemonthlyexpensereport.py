# Generated by Django 3.2.16 on 2023-04-25 12:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0002_alter_typetotalexpense_expense_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='InvoiceMonthlyExpense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='InvoiceMonthlyExpenseReport',
            fields=[
            ],
            options={
                'verbose_name': 'Invoice',
                'verbose_name_plural': 'Invoices',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('reports.invoicemonthlyexpense',),
        ),
    ]
