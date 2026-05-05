from django.db.models import Q
from main.models import ProviderProfile


class SearchService:
    """
    Search logic for finding providers based on multiple criteria.
    Now uses ProviderRegistration relations as the source for category and location search.
    """

    @staticmethod
    def search_providers(params):
        qs = ProviderProfile.objects.select_related('user').all()

        # ── Filter by Keyword ─────────────────────────────────────
        keyword = params.get('keyword')
        if keyword:
            qs = qs.filter(
                Q(user__first_name__icontains=keyword) |
                Q(user__last_name__icontains=keyword) |
                Q(bio__icontains=keyword) |
                Q(user__registrations__pengalaman__icontains=keyword)
            ).distinct()

        # ── Filter by Category ────────────────────────────────────
        category_id = params.get('category')
        if category_id:
            qs = qs.filter(user__registrations__category_id=category_id).distinct()

        # ── Filter by Location ────────────────────────────────────
        kota_id = params.get('kota_id')
        if kota_id:
            qs = qs.filter(user__registrations__kota_id=kota_id).distinct()

        provinsi_id = params.get('provinsi_id')
        if provinsi_id:
            qs = qs.filter(user__registrations__provinsi_id=provinsi_id).distinct()

        # ── Filter by Price (Gaji Diharapkan) ─────────────────────
        min_price = params.get('min_price')
        if min_price is not None:
            qs = qs.filter(user__registrations__gaji_diharapkan__gte=min_price).distinct()

        max_price = params.get('max_price')
        if max_price is not None:
            qs = qs.filter(user__registrations__gaji_diharapkan__lte=max_price).distinct()

        # ── Filter by Gender ──────────────────────────────────────
        gender = params.get('gender')
        if gender:
            qs = qs.filter(user__gender__iexact=gender)

        # ── Filter by Age ─────────────────────────────────────────
        min_age = params.get('min_age')
        if min_age is not None:
            qs = qs.filter(age__gte=min_age)

        max_age = params.get('max_age')
        if max_age is not None:
            qs = qs.filter(age__lte=max_age)

        # ── Filter by Experience ──────────────────────────────────
        experience = params.get('experience')
        if experience is not None:
            qs = qs.filter(years_of_experience__gte=experience)

        # ── Filter by Rating ──────────────────────────────────────
        rating = params.get('rating')
        if rating is not None:
            qs = qs.filter(rating_average__gte=rating)

        # ── Filter by Verification Status ─────────────────────────
        if params.get('verified_only'):
            qs = qs.filter(is_verified=True)

        # ── Ordering ──────────────────────────────────────────────
        ordering = params.get('ordering')
        if ordering == 'price_asc':
            qs = qs.order_by('user__registrations__gaji_diharapkan')
        elif ordering == 'price_desc':
            qs = qs.order_by('-user__registrations__gaji_diharapkan')
        elif ordering == 'rating_desc':
            qs = qs.order_by('-rating_average')
        elif ordering == 'experience_desc':
            qs = qs.order_by('-years_of_experience')
        else:
            # Default to most recent
            qs = qs.order_by('-created_at')

        return qs.distinct()
