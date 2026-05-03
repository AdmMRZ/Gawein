import random
from django.core.management.base import BaseCommand
from django.db import transaction
from main.models import User, ClientProfile, ProviderProfile, Category, Service, Province, City


class Command(BaseCommand):
    help = 'Seed the database with provinces, cities, categories, and dummy users.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting database seeder...")

        try:
            with transaction.atomic():
                self.seed_locations()
                self.seed_categories()
                self.seed_users()
            self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error seeding database: {e}"))

    def seed_locations(self):
        self.stdout.write("Seeding provinces and cities...")
        provinces_data = {
            'DKI Jakarta': ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara'],
            'Jawa Barat': ['Bandung', 'Depok', 'Bogor', 'Bekasi'],
            'Banten': ['Tangerang', 'Tangerang Selatan'],
            'Jawa Timur': ['Surabaya', 'Malang'],
            'Bali': ['Denpasar', 'Badung'],
        }

        for prov_name, cities in provinces_data.items():
            province, _ = Province.objects.get_or_create(name=prov_name)
            for city_name in cities:
                City.objects.get_or_create(province=province, name=city_name)

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
        
        # Helper cities
        jaksel = City.objects.get(name='Jakarta Selatan')
        bandung = City.objects.get(name='Bandung')

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
            )
            ClientProfile.objects.create(
                user=client_user,
                phone='081234567890',
                city=jaksel
            )

        # 3. Providers
        providers_info = [
            {
                'email': 'cleaner@example.com', 'first': 'Siti', 'last': 'Bersih', 'gender': 'female',
                'age': 28, 'exp': 5, 'city': jaksel, 'cat': 'Pembersih Rumah', 'price': 150000.00
            },
            {
                'email': 'plumber@example.com', 'first': 'Agus', 'last': 'Pipa', 'gender': 'male',
                'age': 35, 'exp': 8, 'city': jaksel, 'cat': 'Tukang Ledeng', 'price': 250000.00
            },
            {
                'email': 'electrician@example.com', 'first': 'Bambang', 'last': 'Setrum', 'gender': 'male',
                'age': 42, 'exp': 15, 'city': bandung, 'cat': 'Tukang Listrik', 'price': 300000.00
            },
            {
                'email': 'painter@example.com', 'first': 'Joko', 'last': 'Kuas', 'gender': 'male',
                'age': 30, 'exp': 3, 'city': bandung, 'cat': 'Tukang Cat', 'price': 400000.00
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
                    gender=p_info['gender']
                )
                
                profile = ProviderProfile.objects.create(
                    user=p_user,
                    bio=f"Saya {p_info['first']} siap membantu anda dengan pengalaman {p_info['exp']} tahun.",
                    gender=p_info['gender'],
                    age=p_info['age'],
                    city=p_info['city'],
                    years_of_experience=p_info['exp'],
                    is_verified=True,  # Important for visibility
                    verification_status='verified',
                    rating_average=round(random.uniform(4.0, 5.0), 1),
                    total_reviews=random.randint(10, 100)
                )

                category = Category.objects.get(name=p_info['cat'])
                Service.objects.create(
                    provider=profile,
                    category=category,
                    title=f"Jasa {p_info['cat']} oleh {p_info['first']}",
                    description=f"Layanan {p_info['cat']} profesional, cepat, dan terpercaya.",
                    price=p_info['price'],
                    city=p_info['city'],
                )
