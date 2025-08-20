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
from django.http import JsonResponse, HttpResponse
from django.utils.dateparse import parse_date
from openpyxl import Workbook
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet



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
    category = request.query_params.get('category')  
    location = request.query_params.get('location')  

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


def filter_sales(request):
    """Shared filter logic for Sales."""
    qs = Transaction.objects.all()
    agent_id = request.GET.get("agent_id")
    client_id = request.GET.get("client_id")
    status = request.GET.get("status")
    date_from = request.GET.get("date_from")
    date_to = request.GET.get("date_to")

    if agent_id:
        qs = qs.filter(agent_id=agent_id)
    if client_id:
        qs = qs.filter(client_id=client_id)
    if status:
        qs = qs.filter(status=status)
    if date_from:
        qs = qs.filter(date__gte=parse_date(date_from))
    if date_to:
        qs = qs.filter(date__lte=parse_date(date_to))

    return qs


def custom_report(request):
    format_type = request.GET.get("format", "pdf")
    qs = filter_sales(request)

    # Common data
    rows = [
        ["Date", "Agent", "Client", "Amount", "Transaction"]
    ] + [
        [s.signed_at.strftime("%Y-%m-%d"), str(s.agent), str(s.buyer), s.amount, s.transaction_type ]
        for s in qs
    ]

    # JSON
    if format_type == "json":
        return JsonResponse({"results": rows[1:]})

    # Excel
    elif format_type == "excel":
        wb = Workbook()
        ws = wb.active
        for row in rows:
            ws.append(row)
        response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = "attachment; filename=sales_report.xlsx"
        wb.save(response)
        return response

    # PDF
    elif format_type == "pdf":
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = "attachment; filename=sales_report.pdf"
        doc = SimpleDocTemplate(response, pagesize=A4)
        style = getSampleStyleSheet()
        elements = [Paragraph("Sales Report", style["Heading2"])]
        table = Table(rows)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(table)
        doc.build(elements)
        return response

    return JsonResponse({"error": "Invalid format"}, status=400)
