import random
from django.core.management.base import BaseCommand
from django.db import transaction
from main.models import User, ClientProfile, ProviderProfile, Category, ProviderRegistration


class Command(BaseCommand):
    help = 'Seed the database with categories, dummy users, and provider registrations.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting database seeder...")

        try:
            with transaction.atomic():
                self.seed_categories()
                self.seed_users()
            self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error seeding database: {e}"))

    def seed_categories(self):
        self.stdout.write("Seeding categories...")
        categories_data = [
            {'name': 'Pembersih Rumah', 'icon': 'sparkles-outline'},
            {'name': 'Tukang Ledeng', 'icon': 'water-outline'},
            {'name': 'Tukang Listrik', 'icon': 'flash-outline'},
            {'name': 'Tukang Kebun', 'icon': 'leaf-outline'},
            {'name': 'Jasa Pindahan', 'icon': 'bus-outline'},
            {'name': 'Perbaikan Rumah', 'icon': 'hammer-outline'},
            {'name': 'Tukang Cat', 'icon': 'color-palette-outline'},
            {'name': 'IT Support', 'icon': 'laptop-outline'},
            {'name': 'Pest Control', 'icon': 'bug-outline'},
            {'name': 'Tukang Kayu', 'icon': 'construct-outline'},
        ]
        for cat in categories_data:
            Category.objects.get_or_create(
                name=cat['name'],
                defaults={'icon_name': cat['icon'], 'description': f'Jasa {cat["name"]} profesional.'}
            )

    def seed_users(self):
        self.stdout.write("Seeding dummy users...")
        
        # Placeholder location IDs
        LOC_JAKSEL = {'prov': '31', 'kota': '3174', 'nama': 'Jakarta Selatan'}
        LOC_BANDUNG = {'prov': '32', 'kota': '3273', 'nama': 'Kota Bandung'}

        # 1. Admin
        if not User.objects.filter(email='admin@gawein.com').exists():
            User.objects.create_superuser('admin@gawein.com', 'admin@gawein.com', 'admin123')

        # 2. Client
        if not User.objects.filter(email='client@example.com').exists():
            client_user = User.objects.create_user(
                username='client_user',
                email='client@example.com',
                password='password123',
                first_name='Budi',
                last_name='Pencari',
                role=User.Role.CLIENT,
                phone='081234567890',
                gender='male'
            )
            # Profile created by signal usually, but ensure it exists
            ClientProfile.objects.get_or_create(user=client_user)

        # 3. Providers
        providers_info = [
            {
                'email': 'cleaner@example.com', 'first': 'Siti', 'last': 'Bersih', 'gender': 'female',
                'age': 28, 'exp': 5, 'loc': LOC_JAKSEL, 'cat': 'Pembersih Rumah', 'price': 150000.00
            },
            {
                'email': 'plumber@example.com', 'first': 'Agus', 'last': 'Pipa', 'gender': 'male',
                'age': 35, 'exp': 8, 'loc': LOC_JAKSEL, 'cat': 'Tukang Ledeng', 'price': 250000.00
            },
            {
                'email': 'electrician@example.com', 'first': 'Bambang', 'last': 'Setrum', 'gender': 'male',
                'age': 42, 'exp': 15, 'loc': LOC_BANDUNG, 'cat': 'Tukang Listrik', 'price': 300000.00
            },
            {
                'email': 'painter@example.com', 'first': 'Joko', 'last': 'Kuas', 'gender': 'male',
                'age': 30, 'exp': 3, 'loc': LOC_BANDUNG, 'cat': 'Tukang Cat', 'price': 400000.00
            },
        ]

        for p_info in providers_info:
            if not User.objects.filter(email=p_info['email']).exists():
                p_user = User.objects.create_user(
                    username=p_info['email'].split('@')[0],
                    email=p_info['email'],
                    password='password123',
                    first_name=p_info['first'],
                    last_name=p_info['last'],
                    role=User.Role.PROVIDER,
                    gender=p_info['gender'],
                    phone=f"08{random.randint(100000000, 999999999)}"
                )
                
                profile, _ = ProviderProfile.objects.get_or_create(
                    user=p_user,
                    defaults={
                        'bio': f"Saya {p_info['first']} siap membantu anda dengan pengalaman {p_info['exp']} tahun.",
                        'age': p_info['age'],
                        'years_of_experience': p_info['exp'],
                        'is_verified': True,
                        'verification_status': 'verified',
                        'rating_average': round(random.uniform(4.0, 5.0), 1),
                        'total_reviews': random.randint(10, 100)
                    }
                )

                category = Category.objects.get(name=p_info['cat'])
                


                # Create ProviderRegistration (Source of truth for location search)
                ProviderRegistration.objects.create(
                    user=p_user,
                    category=category,
                    provinsi_id=p_info['loc']['prov'],
                    kota_id=p_info['loc']['kota'],
                    provinsi_name=p_info['loc']['nama'].split(' ')[-1], # Simple split for demo
                    kota_name=p_info['loc']['nama'],
                    pengalaman=f"Berpengalaman dalam {p_info['cat']}",
                    tahun_pengalaman=p_info['exp'],
                    gaji_diharapkan=p_info['price']
                )
