# Generated by Django 3.2.16 on 2023-03-29 14:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0021_auto_20230323_0536'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExpenseType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('expense_name', models.CharField(max_length=255)),
                ('expense_description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AddField(
            model_name='invoice',
            name='client',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tools.client'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pipeline',
            name='client',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tools.client'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='expense',
            name='expense_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tools.expensetype'),
        ),
    ]
