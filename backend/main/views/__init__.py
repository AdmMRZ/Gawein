from main.views.auth import RegisterView, LoginView, LogoutView, ChangePasswordView
from main.views.user import ProfileView
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
