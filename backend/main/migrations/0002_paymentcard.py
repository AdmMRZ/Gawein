# Generated manually because the local environment does not have Django installed.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentCard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('card_number', models.CharField(max_length=19)),
                ('expiry_date', models.CharField(max_length=7)),
                ('cvv', models.CharField(max_length=4)),
                ('cardholder_name', models.CharField(max_length=150)),
                ('billing_address', models.CharField(max_length=255)),
                ('is_primary', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payment_cards', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'payment_cards',
                'ordering': ['-is_primary', '-created_at'],
            },
        ),
    ]
