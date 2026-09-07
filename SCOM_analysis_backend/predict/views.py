import yfinance as yf
import joblib
import os
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .serializers import PredictionInputSerializer, PredictionOutputSerializer

class PredictStockAPIView(APIView):
    """
    DRF APIView to generate AI Stock Price Predictions using Random Forest models.
    """
    def get(self, request):
        serializer = PredictionInputSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        ticker = serializer.validated_data['ticker'].upper()

        try:
            data = yf.download(ticker, period="1y")[['Close', 'Volume']].dropna()

            if len(data) < 4:
                return Response(
                    {'error': f'Insufficient data for ticker {ticker} to compute predictions.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            close_prices = data['Close']
            if isinstance(close_prices, str):
                return Response({'error': 'Invalid close price data format'}, status=status.HTTP_400_BAD_REQUEST)

            data['Lag1'] = close_prices.shift(1)
            data['Lag2'] = close_prices.shift(2)
            data['Lag3'] = close_prices.shift(3)
            data['Pct_Change_Lag1'] = (data['Lag1'] - data['Lag2']) / data['Lag2'] * 100
            data['Pct_Change_Lag2'] = (data['Lag2'] - data['Lag3']) / data['Lag3'] * 100
            data['SMA_20'] = close_prices.rolling(window=20).mean()
            data['SMA_50'] = close_prices.rolling(window=50).mean()
            
            diff = close_prices.diff(1)
            up = diff.clip(lower=0).rolling(window=14).mean()
            down = -1 * diff.clip(upper=0).rolling(window=14).mean()
            rsi = 100 - (100 / (1 + (up / (down + 1e-9))))
            data['RSI'] = rsi

            clean_data = data.dropna()
            if clean_data.empty:
                return Response({'error': 'Not enough calculated indicators for prediction'}, status=status.HTTP_400_BAD_REQUEST)

            latest_row = clean_data.iloc[-1]
            input_data = clean_data[['Pct_Change_Lag1', 'Pct_Change_Lag2', 'SMA_20', 'SMA_50', 'RSI']].iloc[-1:].values

            model_path = os.path.join(settings.BASE_DIR, 'random_forest', 'models', 'rf_model.pkl')
            if not os.path.exists(model_path):
                return Response({'error': 'Trained Random Forest model file (rf_model.pkl) not found. Please train model first.'}, status=status.HTTP_404_NOT_FOUND)

            model = joblib.load(model_path)
            prediction = int(model.predict(input_data)[0])
            probabilities = model.predict_proba(input_data)[0]

            response_data = {
                'ticker': ticker,
                'prediction': prediction,
                'signal': 'BULLISH (BUY)' if prediction == 1 else 'BEARISH (SELL)',
                'probability_class_0': round(float(probabilities[0]), 4),
                'probability_class_1': round(float(probabilities[1]), 4),
                'latest_close': round(float(latest_row['Close']), 2),
                'rsi': round(float(latest_row['RSI']), 2) if not np.isnan(latest_row['RSI']) else None,
                'sma_20': round(float(latest_row['SMA_20']), 2) if not np.isnan(latest_row['SMA_20']) else None,
                'sma_50': round(float(latest_row['SMA_50']), 2) if not np.isnan(latest_row['SMA_50']) else None,
            }

            out_serializer = PredictionOutputSerializer(data=response_data)
            out_serializer.is_valid()
            return Response(out_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
