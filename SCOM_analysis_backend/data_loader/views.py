import yfinance as yf
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import StockData
from .serializers import (
    StockDataSerializer,
    FetchStockQuerySerializer,
    StockDataResponseSerializer
)

class StockDataViewSet(ModelViewSet):
    """
    DRF ViewSet for persisted stock data objects.
    Provides standard list, create, retrieve, update, destroy endpoints.
    """
    queryset = StockData.objects.all().order_by('-date')
    serializer_class = StockDataSerializer

class FetchStockDataView(APIView):
    """
    DRF APIView to fetch live historical stock market data via yfinance.
    Uses serializers for request validation and response formatting.
    """
    def get(self, request):
        serializer = FetchStockQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        ticker = serializer.validated_data.get('ticker', 'GOOGL').upper()
        start_date = serializer.validated_data.get('start_date', "2024-01-01")
        end_date = serializer.validated_data.get('end_date', "2025-12-31")

        try:
            stock = yf.Ticker(ticker)
            data = stock.history(start=start_date, end=end_date)

            if data.empty:
                return Response(
                    {'error': f'No stock data found for ticker "{ticker}". Check symbol and dates.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            stock_data = {
                'dates': data.index.strftime('%Y-%m-%d').tolist(),
                'prices': [round(val, 2) for val in (data['Close'].tolist() if 'Close' in data else [])],
                'opens': [round(val, 2) for val in (data['Open'].tolist() if 'Open' in data else [])],
                'highs': [round(val, 2) for val in (data['High'].tolist() if 'High' in data else [])],
                'lows': [round(val, 2) for val in (data['Low'].tolist() if 'Low' in data else [])],
                'volumes': data['Volume'].tolist() if 'Volume' in data else [],
                'price_high': round(float(max(data['Close'])), 2) if 'Close' in data and not data['Close'].empty else None,
                'price_low': round(float(min(data['Close'])), 2) if 'Close' in data and not data['Close'].empty else None,
                'avg_volume': round(float(sum(data['Volume']) / len(data['Volume'])), 2) if 'Volume' in data and len(data['Volume']) > 0 else 0,
            }

            resp_serializer = StockDataResponseSerializer(data=stock_data)
            resp_serializer.is_valid()
            return Response(resp_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)