from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from data_loader.views import StockDataViewSet, FetchStockDataView
from random_forest.views import TrainModelAPIView, TrainBatchModelAPIView, TrainingProgressAPIView
from predict.views import PredictStockAPIView

router = DefaultRouter()
router.register(r'saved-stocks', StockDataViewSet, basename='saved-stocks')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # DRF ViewSet endpoints
    path('api/', include(router.urls)),
    
    # DRF API View endpoints
    path('stock_data/', FetchStockDataView.as_view(), name='stock_data'),
    path('api/stock_data/', FetchStockDataView.as_view(), name='api_stock_data'),
    path('saved-stock-data/', StockDataViewSet.as_view({'get': 'list'}), name='get_saved_stock_data'),
    path('train/', TrainModelAPIView.as_view(), name='train_model'),
    path('api/train/', TrainModelAPIView.as_view(), name='api_train_model'),
    path('train_batch/', TrainBatchModelAPIView.as_view(), name='train_batch_model'),
    path('api/train_batch/', TrainBatchModelAPIView.as_view(), name='api_train_batch_model'),
    path('progress/', TrainingProgressAPIView.as_view(), name='training_progress'),
    path('api/progress/', TrainingProgressAPIView.as_view(), name='api_training_progress'),
    path('predict/', PredictStockAPIView.as_view(), name='predict_price'),
    path('api/predict/', PredictStockAPIView.as_view(), name='api_predict_price'),
]
