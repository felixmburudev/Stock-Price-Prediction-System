import os
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .train_model import train_model, train_batch_model
from .serializers import (
    ModelTrainingParamSerializer,
    BatchTrainingParamSerializer,
    TrainingProgressSerializer
)

class TrainModelAPIView(APIView):
    """
    DRF APIView to handle single stock model training.
    """
    def get(self, request):
        serializer = ModelTrainingParamSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        ticker = data['ticker']
        n_estimators = data['n_estimators']
        max_depth = data['max_depth']
        random_state = data['random_state']
        start_date = data['start_date']
        end_date = data['end_date']

        try:
            success = train_model(ticker, n_estimators, max_depth, random_state, start_date, end_date)
            if success:
                return Response({"status": "success", "message": f"Model for {ticker} trained successfully."})
            else:
                return Response({"status": "error", "message": "Training failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TrainBatchModelAPIView(APIView):
    """
    DRF APIView to handle batch stock model training.
    """
    def get(self, request):
        serializer = BatchTrainingParamSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        tickers = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'AMZN']
        try:
            train_batch_model(
                tickers,
                data['start_date'],
                data['end_date'],
                data['n_estimators'],
                data['max_depth'],
                data['random_state']
            )
            return Response({"status": "success", "message": "Batch model training initiated successfully."})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TrainingProgressAPIView(APIView):
    """
    DRF APIView to fetch current model training progress.
    """
    def get(self, request):
        try:
            progress_file = os.path.join(settings.BASE_DIR, 'random_forest', 'training_progress.json')
            if os.path.exists(progress_file):
                with open(progress_file, 'r') as f:
                    progress_data = json.load(f)
            else:
                progress_data = {"stage": "Not started", "percentage": 0}
            
            serializer = TrainingProgressSerializer(data=progress_data)
            serializer.is_valid()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"stage": "Error", "percentage": 0, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)