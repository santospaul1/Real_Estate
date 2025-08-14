# myproject/middleware.py

from django.shortcuts import redirect

class LoginRedirectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if response.status_code == 401:
            # Check if browser expects HTML (not JSON)
            accept = request.META.get('HTTP_ACCEPT', '')
            if 'text/html' in accept:
                return redirect('/api/accounts/login/')  # or your login URL

        return response
