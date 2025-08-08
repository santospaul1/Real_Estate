from django.db import models
from users.models import User

class Property(models.Model):
    CATEGORY_CHOICES = [
        ('residential', 'Residential'),
        ('commercial', 'Commercial'),
        ('rental', 'Rental'),
        ('sale', 'Sale'),
    ]

    STATUS_CHOICES = [
        ('available', 'Available'),
        ('under_contract', 'Under Contract'),
        ('sold', 'Sold'),
        ('rented', 'Rented'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    location = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
