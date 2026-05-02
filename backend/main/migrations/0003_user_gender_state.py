# Keeps Django migration state aligned with the manually-created users.gender column.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_paymentcard'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AddField(
                    model_name='user',
                    name='gender',
                    field=models.CharField(blank=True, default='', max_length=20),
                ),
            ],
        ),
    ]
