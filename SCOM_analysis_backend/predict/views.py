import yfinance as yf
import joblib
import os
import pandas as pd
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .serializers import PredictionInputSerializer, PredictionOutputSerializer

def safe_float(val):
    if val is None:
        return None
    try:
        if isinstance(val, (pd.Series, np.ndarray)):
            val = val.iloc[0] if hasattr(val, 'iloc') else val[0]
        f_val = float(val)
        return round(f_val, 2) if not np.isnan(f_val) else None
    except Exception:
        return None

class PredictStockAPIView(APIView):
    """
    DRF APIView to generate Stock Price Predictions using Random Forest models.
    """
    def get(self, request):
        serializer = PredictionInputSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        ticker = serializer.validated_data['ticker'].upper()

        try:
            stock = yf.Ticker(ticker)
            data = stock.history(period="1y")

            if data.empty or len(data) < 4:
                return Response(
                    {'error': f'Insufficient data for ticker {ticker} to compute predictions.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            close_prices = data['Close']

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
            raw_pred = model.predict(input_data)[0]
            prediction = int(raw_pred.iloc[0] if isinstance(raw_pred, (pd.Series, np.ndarray)) else raw_pred)

            probabilities = model.predict_proba(input_data)[0]
            prob_0 = float(probabilities[0].iloc[0] if isinstance(probabilities[0], (pd.Series, np.ndarray)) else probabilities[0])
            prob_1 = float(probabilities[1].iloc[0] if isinstance(probabilities[1], (pd.Series, np.ndarray)) else probabilities[1])

            response_data = {
                'ticker': ticker,
                'prediction': prediction,
                'signal': 'BULLISH (BUY)' if prediction == 1 else 'BEARISH (SELL)',
                'probability_class_0': round(prob_0, 4),
                'probability_class_1': round(prob_1, 4),
                'latest_close': safe_float(latest_row['Close']),
                'rsi': safe_float(latest_row['RSI']),
                'sma_20': safe_float(latest_row['SMA_20']),
                'sma_50': safe_float(latest_row['SMA_50']),
            }

            out_serializer = PredictionOutputSerializer(data=response_data)
            out_serializer.is_valid()
            return Response(out_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
