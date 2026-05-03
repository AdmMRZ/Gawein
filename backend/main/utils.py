from functools import wraps
from rest_framework.response import Response
from main.models import IdempotencyKey

def idempotent_request(view_func):
    """
    Decorator to handle idempotent requests using 'Idempotency-Key' header.
    """
    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):
        idempotency_key = request.headers.get('Idempotency-Key')
        
        # If no key provided, just process as normal
        if not idempotency_key:
            return view_func(self, request, *args, **kwargs)
        
        # Check if key already exists for this user
        existing_key = IdempotencyKey.objects.filter(key=idempotency_key, user=request.user).first()
        if existing_key:
            return Response(existing_key.response_body, status=existing_key.response_code)
        
        # Process the request
        response = view_func(self, request, *args, **kwargs)
        
        # Store the response if it's not a server error
        if response.status_code < 500:
            IdempotencyKey.objects.create(
                key=idempotency_key,
                user=request.user,
                response_code=response.status_code,
                response_body=response.data
            )
            
        return response
    return _wrapped_view
