from django.db.models import QuerySet, Q, Avg

from main.models import Category, Service, ProviderProfile


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

    # ── Service ─────────────────────────────────────────────

    @staticmethod
    def list_services_by_provider(provider: ProviderProfile) -> QuerySet:
        return (
            Service.objects
            .select_related('category', 'provider__user')
            .filter(provider=provider)
        )

    @staticmethod
    def get_service_by_id(service_id: int) -> Service | None:
        return (
            Service.objects
            .select_related('category', 'provider__user')
            .filter(pk=service_id)
            .first()
        )

    @staticmethod
    def create_service(provider: ProviderProfile, **kwargs) -> Service:
        return Service.objects.create(provider=provider, **kwargs)

    @staticmethod
    def update_service(service: Service, **kwargs) -> Service:
        for key, value in kwargs.items():
            setattr(service, key, value)
        service.save()
        return service

    @staticmethod
    def delete_service(service: Service) -> None:
        service.delete()

    # ── Search ──────────────────────────────────────────────

    @staticmethod
    def search_providers(
        keyword: str | None = None,
        category: int | None = None,
        location: str | None = None,
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
        Complex search across providers and their services.
        Returns ProviderProfile queryset filtered by multi-dimensional criteria.
        """
        qs = (
            ProviderProfile.objects
            .select_related('user')
            .prefetch_related('services__category')
            .distinct()
        )

        # Filter by keyword (searches provider bio, service title/description, user name)
        if keyword:
            qs = qs.filter(
                Q(bio__icontains=keyword)
                | Q(user__first_name__icontains=keyword)
                | Q(user__last_name__icontains=keyword)
                | Q(services__title__icontains=keyword)
                | Q(services__description__icontains=keyword)
            )

        # Filter by service category
        if category:
            qs = qs.filter(services__category_id=category)

        # Filter by provider location
        if location:
            qs = qs.filter(location__icontains=location)

        # Filter by price range (on provider's services)
        if min_price is not None:
            qs = qs.filter(services__price__gte=min_price)
        if max_price is not None:
            qs = qs.filter(services__price__lte=max_price)

        # Filter by provider attributes
        if gender:
            qs = qs.filter(gender=gender)
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
                'price': 'services__price',
                '-price': '-services__price',
                'experience': 'years_of_experience',
                '-experience': '-years_of_experience',
                'newest': '-created_at',
            }
            order_field = allowed_orderings.get(ordering, '-rating_average')
            qs = qs.order_by(order_field)

        return qs
