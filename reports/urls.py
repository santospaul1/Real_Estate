# reports/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('sales/', views.sales_report, name='sales-report'),
    path('sales/export/csv/', views.export_sales_csv, name='export-sales-csv'),
]
