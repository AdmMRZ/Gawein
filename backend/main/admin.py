from django.contrib import admin

from main.models import (
    User,
    ClientProfile,
    ProviderProfile,
    Category,
    Service,
    Availability,
    Booking,
    HiringTransaction,
    Review,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'role', 'phone', 'is_active', 'is_verified', 'created_at']
    list_filter = ['role', 'is_active', 'is_verified']
    search_fields = ['email', 'username', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'city']
    search_fields = ['user__email', 'city__name']


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'gender', 'age', 'city',
        'years_of_experience', 'is_verified', 'verification_status',
        'rating_average', 'total_reviews',
    ]
    list_filter = ['is_verified', 'verification_status', 'gender']
    search_fields = ['user__email', 'bio', 'city__name']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['title', 'provider', 'category', 'price', 'is_active']
    list_filter = ['is_active', 'category']
    search_fields = ['title', 'description']


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ['provider', 'date', 'start_time', 'end_time', 'is_available']
    list_filter = ['is_available', 'date']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'provider', 'service', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['client__email', 'provider__user__email']


@admin.register(HiringTransaction)
class HiringTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'client', 'provider', 'service',
        'agreed_price', 'work_date', 'status', 'created_at',
    ]
    list_filter = ['status']
    search_fields = ['client__email', 'provider__user__email']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'provider', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['client__email', 'provider__user__email', 'comment']
