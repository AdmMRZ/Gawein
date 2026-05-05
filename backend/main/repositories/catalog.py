from django.db.models import QuerySet, Q, Avg

from main.models import Category, ProviderProfile, ProviderRegistration


class CatalogRepository:
    """Database access layer for Category and Service models."""

    # ── Category ────────────────────────────────────────────

    @staticmethod
    def list_categories(active_only: bool = True) -> QuerySet:
        qs = Category.objects.all()
        if active_only:
            qs = qs.filter(is_active=True)
        return qs

    @staticmethod
    def get_category_by_id(category_id: int) -> Category | None:
        return Category.objects.filter(pk=category_id).first()

    @staticmethod
    def create_category(**kwargs) -> Category:
        return Category.objects.create(**kwargs)

    @staticmethod
    def update_category(category: Category, **kwargs) -> Category:
        for key, value in kwargs.items():
            setattr(category, key, value)
        category.save()
        return category

    @staticmethod
    def delete_category(category: Category) -> None:
        category.delete()



    # ── Search ──────────────────────────────────────────────

    @staticmethod
    def search_providers(
        keyword: str | None = None,
        category: int | None = None,
        kota_id: str | None = None,
        provinsi_id: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        gender: str | None = None,
        min_age: int | None = None,
        max_age: int | None = None,
        experience: int | None = None,
        rating: float | None = None,
        verified_only: bool = False,
        ordering: str | None = None,
    ) -> QuerySet:
        """
        Search providers via ProviderRegistration (the Lapak).
        Returns ProviderProfile queryset filtered by multi-dimensional criteria.
        Filters location against ProviderRegistration's Regional API fields.
        """
        qs = (
            ProviderProfile.objects
            .select_related('user')
            .prefetch_related('user__registrations')
            .distinct()
        )

        # Filter by keyword (searches provider bio, registration category, user name)
        if keyword:
            reg_matches = ProviderRegistration.objects.filter(
                Q(category__name__icontains=keyword)
                | Q(pengalaman__icontains=keyword)
                | Q(kota_name__icontains=keyword)
            ).values_list('user_id', flat=True)

            qs = qs.filter(
                Q(bio__icontains=keyword)
                | Q(user__first_name__icontains=keyword)
                | Q(user__last_name__icontains=keyword)
                | Q(user_id__in=reg_matches)
            )

        if category:
            reg_cat_users = ProviderRegistration.objects.filter(
                category_id=category
            ).values_list('user_id', flat=True)
            qs = qs.filter(user_id__in=reg_cat_users)

        # Filter by kota location (via ProviderRegistration.kota_id)
        if kota_id:
            reg_location_users = ProviderRegistration.objects.filter(
                kota_id=str(kota_id)
            ).values_list('user_id', flat=True)
            qs = qs.filter(user_id__in=reg_location_users)

        # Filter by provinsi location (via ProviderRegistration.provinsi_id)
        if provinsi_id:
            reg_prov_users = ProviderRegistration.objects.filter(
                provinsi_id=str(provinsi_id)
            ).values_list('user_id', flat=True)
            qs = qs.filter(user_id__in=reg_prov_users)

        # Filter by price range (via ProviderRegistration.gaji_diharapkan)
        if min_price is not None:
            reg_price_users = ProviderRegistration.objects.filter(
                gaji_diharapkan__gte=min_price
            ).values_list('user_id', flat=True)
            qs = qs.filter(user_id__in=reg_price_users)
        if max_price is not None:
            reg_price_users = ProviderRegistration.objects.filter(
                gaji_diharapkan__lte=max_price
            ).values_list('user_id', flat=True)
            qs = qs.filter(user_id__in=reg_price_users)

        # Filter by provider attributes (on ProviderProfile)
        if gender:
            qs = qs.filter(user__gender=gender)
        if min_age is not None:
            qs = qs.filter(age__gte=min_age)
        if max_age is not None:
            qs = qs.filter(age__lte=max_age)
        if experience is not None:
            qs = qs.filter(years_of_experience__gte=experience)

        # Filter by rating
        if rating is not None:
            qs = qs.filter(rating_average__gte=rating)

        # Filter by verification
        if verified_only:
            qs = qs.filter(is_verified=True)

        # Ordering
        if ordering:
            allowed_orderings = {
                'rating': 'rating_average',
                '-rating': '-rating_average',
                'experience': 'years_of_experience',
                '-experience': '-years_of_experience',
                'newest': '-created_at',
            }
            order_field = allowed_orderings.get(ordering, '-rating_average')
            qs = qs.order_by(order_field)

        return qs
