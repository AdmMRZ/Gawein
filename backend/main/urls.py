from django.urls import path

from main.views.auth import RegisterView, LoginView, LogoutView, ChangePasswordView
from main.views.user import ProfileView, PaymentCardListCreateView, PaymentCardDetailView
from main.views.catalog import CategoryListCreateView, CategoryDetailView
from main.views.provider import (
    ProviderListView,
    ProviderDetailView,
    MyServiceListCreateView,
    MyServiceDetailView,
)
from main.views.search import ProviderSearchView
from main.views.scheduling import (
    AvailabilityListCreateView,
    AvailabilityDetailView,
    BookingListCreateView,
    BookingDetailView,
)
from main.views.hiring import (
    HiringListCreateView,
    HiringDetailView,
    HiringStatusView,
)
from main.views.history import HistoryListView, HistoryDetailView
from main.views.review import ReviewListCreateView, ReviewDetailView
from main.views.admin import (
    PendingProviderListView,
    VerifyProviderView,
    RejectProviderView,
)

app_name = 'main'

urlpatterns = [
    # ── Auth & User ─────────────────────────────────────────
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('payment-cards/', PaymentCardListCreateView.as_view(), name='payment-card-list-create'),
    path('payment-cards/<int:pk>/', PaymentCardDetailView.as_view(), name='payment-card-detail'),

    # ── Category ────────────────────────────────────────────
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),

    # ── Provider / Catalog ──────────────────────────────────
    path('providers/', ProviderListView.as_view(), name='provider-list'),
    path('providers/<int:pk>/', ProviderDetailView.as_view(), name='provider-detail'),
    path('providers/services/', MyServiceListCreateView.as_view(), name='my-service-list-create'),
    path('providers/services/<int:pk>/', MyServiceDetailView.as_view(), name='my-service-detail'),

    # ── Search & Filter ─────────────────────────────────────
    path('search/providers/', ProviderSearchView.as_view(), name='provider-search'),

    # ── Scheduling ──────────────────────────────────────────
    path('availability/', AvailabilityListCreateView.as_view(), name='availability-list-create'),
    path('availability/<int:pk>/', AvailabilityDetailView.as_view(), name='availability-detail'),
    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),

    # ── Hiring ──────────────────────────────────────────────
    path('hirings/', HiringListCreateView.as_view(), name='hiring-list-create'),
    path('hirings/<int:pk>/', HiringDetailView.as_view(), name='hiring-detail'),
    path('hirings/<int:pk>/status/', HiringStatusView.as_view(), name='hiring-status'),

    # ── History ─────────────────────────────────────────────
    path('history/', HistoryListView.as_view(), name='history-list'),
    path('history/<int:pk>/', HistoryDetailView.as_view(), name='history-detail'),

    # ── Review ──────────────────────────────────────────────
    path('reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
    path('reviews/<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),

    # ── Admin Verification ──────────────────────────────────
    path('admin/providers/pending/', PendingProviderListView.as_view(), name='admin-pending-providers'),
    path('admin/providers/<int:pk>/verify/', VerifyProviderView.as_view(), name='admin-verify-provider'),
    path('admin/providers/<int:pk>/reject/', RejectProviderView.as_view(), name='admin-reject-provider'),
]
