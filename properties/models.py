from django.db import models
from django.utils import timezone
from users.models import User  # your custom user with roles


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
    date_listed = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ---------- Property Photos ----------

class PropertyPhoto(models.Model):
    property = models.ForeignKey('Property', related_name='photos', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='property_photos/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.property.title} ({self.id})"



# ---------- Lead ----------

class Lead(models.Model):
    PIPELINE_STAGE = [
        ('lead', 'Lead'),
        ('prospect', 'Prospect'),
        ('client', 'Client'),
    ]

    SOURCE_CHOICES = [
        ('web', 'Web form'),
        ('phone', 'Phone'),
        ('walkin', 'Walk-in'),
        ('import', 'Import'),
        ('other', 'Other'),
    ]

    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, null=True)
    preferred_location = models.CharField(max_length=255, blank=True)
    budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    timeline_days = models.IntegerField(null=True, blank=True)
    engagement_score = models.IntegerField(default=0)
    stage = models.CharField(max_length=20, choices=PIPELINE_STAGE, default='lead')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='web')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_leads')
    interested_property = models.ForeignKey('Property', on_delete=models.SET_NULL, null=True, blank=True, related_name='interested_leads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['stage']),
            models.Index(fields=['assigned_to']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.stage})"

    def compute_score(self):
        score = 0
        if self.budget and self.budget >= 1_000_000:
            score += 50
        if self.timeline_days and self.timeline_days <= 30:
            score += 30
        if self.preferred_location:
            score += 10
        self.engagement_score = score
        return score




# ---------- Client ----------
class Client(models.Model):
    CLIENT_TYPE = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('both', 'Both'),
    ]

    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, null=True)
    preferences = models.JSONField(default=dict, blank=True)  # e.g., {"beds":3,"budget_max":5000000}
    client_type = models.CharField(max_length=10, choices=CLIENT_TYPE, default='buyer')
    assigned_agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='clients')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['assigned_agent']),
            models.Index(fields=['client_type']),
        ]

    def __str__(self):
        return self.full_name


# ---------- Communication Log ----------
class CommunicationLog(models.Model):
   # related_lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='communications')
    related_client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True, related_name='communications')
    note = models.TextField()
    direction_choices = [('inbound', 'Inbound'), ('outbound', 'Outbound')]
    direction = models.CharField(max_length=10, choices=direction_choices, default='outbound')
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    meta = models.JSONField(default=dict, blank=True)  # e.g., {"call_duration": 120}

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        #target = self.related_lead or self.related_client
        return f"Comm for {target} at {self.timestamp}"


# ---------- Agent Profile & Performance ----------
class AgentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    specialization = models.CharField(max_length=255, blank=True)
    territory = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    active = models.BooleanField(default=True)
    joined_at = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} profile"


class AgentPerformance(models.Model):
    agent = models.OneToOneField(AgentProfile, on_delete=models.CASCADE, related_name='performance')
    deals_closed = models.PositiveIntegerField(default=0)
    total_commission = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    customer_satisfaction = models.FloatField(default=0.0)  # 0-5 scale
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Performance of {self.agent.user.username}"


# ---------- Transaction (Deals / Commission Tracking) ----------
class Transaction(models.Model):
    TRANSACTION_TYPE = [('sale', 'Sale'), ('rent', 'Rent')]

    property = models.ForeignKey('Property', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    buyer = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchases')
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    commission_percent = models.DecimalField(max_digits=5, decimal_places=2, default=3.0)
    commission_amount = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['transaction_type']),
            models.Index(fields=['agent']),
        ]

    def __str__(self):
        return f"{self.transaction_type} #{self.id} - {self.amount}"

    def save(self, *args, **kwargs):
        # compute commission if not provided
        if not self.commission_amount:
            self.commission_amount = (self.amount * (self.commission_percent or 0)) / 100
        # mark property status if sale
        if self.property and self.transaction_type == 'sale':
            self.property.status = 'sold'
            self.property.save(update_fields=['status'])
        if not self.signed_at:
            self.signed_at = timezone.now()
        super().save(*args, **kwargs)


# ---------- Utility on Property: time on market and views/inquiries counters ----------
class PropertyAnalytics(models.Model):
    property = models.OneToOneField('Property', on_delete=models.CASCADE, related_name='analytics')
    views = models.PositiveIntegerField(default=0)
    inquiries = models.PositiveIntegerField(default=0)
    first_listed = models.DateTimeField(null=True, blank=True)
    last_viewed = models.DateTimeField(null=True, blank=True)

    def increment_view(self):
        self.views = (self.views or 0) + 1
        self.last_viewed = timezone.now()
        if not self.first_listed:
            self.first_listed = timezone.now()
        self.save(update_fields=['views', 'last_viewed', 'first_listed'])

    def increment_inquiry(self):
        self.inquiries = (self.inquiries or 0) + 1
        self.save(update_fields=['inquiries'])

    def time_on_market_days(self):
        if not self.first_listed:
            return None
        delta = timezone.now() - self.first_listed
        return delta.days

    def __str__(self):
        return f"Analytics for {self.property.title}"
