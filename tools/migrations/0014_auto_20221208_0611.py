# Generated by Django 3.2.16 on 2022-12-08 06:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0013_alter_expense_expense_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='expense',
            name='date_of_first_payment',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='expense',
            name='date_of_last_payment',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='expense',
            name='expense_frequency',
            field=models.CharField(blank=True, choices=[('W', 'Weekly'), ('BM', 'Bi-Monthly'), ('M', 'Monthly'), ('Q', 'Quarterly')], max_length=2, null=True),
        ),
    ]
