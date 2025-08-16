# reports/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('sales/', views.sales_report, name='sales-report'),
    path('property-pricing/', views.property_pricing_analysis, name='property-pricing'),
    path('agent-performance/', views.detailed_agent_performance, name='agent-performance'),
    path('sales/export/csv/', views.export_sales_csv, name='export-sales-csv'),
    path('custom-report/', views.custom_report, name='custom-report'),
]
