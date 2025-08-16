# reports/views.py
from django.db.models import Sum, Count, Q, Avg
from django.db.models.functions import TruncMonth, TruncQuarter
from properties.models import AgentProfile, Lead, Property, Transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
import csv
from django.http import HttpResponse


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_report(request):
    """
    Query params:
     - period: 'month' or 'quarter' (default: month)
     - year: int (optional, default current year)
    """
    period = request.query_params.get('period', 'month')
    year = int(request.query_params.get('year', datetime.now().year))

    qs = Transaction.objects.filter(signed_at__year=year, transaction_type='sale')

    if period == 'quarter':
        qs = qs.annotate(period=TruncQuarter('signed_at'))
    else:
        qs = qs.annotate(period=TruncMonth('signed_at'))

    sales_data = (
        qs.values('period')
        .annotate(total_sales=Sum('amount'), deals_count=Count('id'))
        .order_by('period')
    )

    # Conversion rates = converted leads / total leads for the period (simplified monthly)
    leads_qs = Lead.objects.filter(created_at__year=year)
    if period == 'quarter':
        leads_qs = leads_qs.annotate(period=TruncQuarter('created_at'))
    else:
        leads_qs = leads_qs.annotate(period=TruncMonth('created_at'))

    leads_data = (
        leads_qs.values('period')
        .annotate(total_leads=Count('id'), converted=Count('id', filter=Q(stage='client')))
        .order_by('period')
    )

    # Merge sales and leads data by period
    leads_dict = {d['period']: d for d in leads_data}
    result = []
    for item in sales_data:
        period_val = item['period']
        leads_info = leads_dict.get(period_val)
        conversion_rate = None
        if leads_info and leads_info['total_leads'] > 0:
            conversion_rate = leads_info['converted'] / leads_info['total_leads']
        result.append({
            'period': period_val.strftime('%Y-%m') if period == 'month' else f"Q{(period_val.month - 1) // 3 + 1}",
            'total_sales': item['total_sales'] or 0,
            'deals_count': item['deals_count'],
            'conversion_rate': round(conversion_rate or 0, 2)
        })

    return Response(result)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def property_pricing_analysis(request):
    category = request.query_params.get('category')  # optional
    location = request.query_params.get('location')  # optional

    qs = Property.objects.filter(status='available')
    if category:
        qs = qs.filter(category=category)
    if location:
        qs = qs.filter(location__icontains=location)

    data = (
        qs.values('category', 'location')
        .annotate(avg_price=Avg('price'), count=Count('id'))
        .order_by('category', 'location')
    )

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detailed_agent_performance(request):

    agents = AgentProfile.objects.select_related('user').all()
    result = []
    for agent in agents:
        txs = Transaction.objects.filter(agent=agent.user)
        deals_closed = txs.count()
        total_commission = txs.aggregate(Sum('commission_amount'))['commission_amount__sum'] or 0
        client_count = agent.user.clients.count()  # Assuming related_name='clients' on Client assigned_agent
        result.append({
            'agent_id': agent.id,
            'username': agent.user.username,
            'deals_closed': deals_closed,
            'total_commission': float(total_commission),
            'client_count': client_count,
        })
    return Response(result)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_sales_csv(request):
    qs = Transaction.objects.filter(transaction_type='sale')

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="sales.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Property', 'Buyer', 'Agent', 'Amount', 'Commission', 'Date'])
    for tx in qs:
        writer.writerow([
            tx.id,
            tx.property.title if tx.property else '',
            tx.buyer.full_name if tx.buyer else '',
            tx.agent.username if tx.agent else '',
            tx.amount,
            tx.commission_amount,
            tx.signed_at.strftime('%Y-%m-%d') if tx.signed_at else ''
        ])
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def custom_report(request):
    """
    Expect payload like:
    {
      "metrics": ["total_sales", "deals_closed"],
      "group_by": ["month"]
    }
    This is just a stub: returns fixed example data.
    """
    data = [
        {"month": "2025-01", "total_sales": 100000, "deals_closed": 10},
        {"month": "2025-02", "total_sales": 120000, "deals_closed": 12},
    ]
    return Response(data)