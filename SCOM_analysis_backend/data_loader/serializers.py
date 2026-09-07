from rest_framework import serializers
from .models import StockData

class StockDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockData
        fields = '__all__'

class FetchStockQuerySerializer(serializers.Serializer):
    ticker = serializers.CharField(default='GOOGL', max_length=10)
    start_date = serializers.DateField(required=False, input_formats=['%Y-%m-%d'])
    end_date = serializers.DateField(required=False, input_formats=['%Y-%m-%d'])

class StockDataResponseSerializer(serializers.Serializer):
    dates = serializers.ListField(child=serializers.CharField())
    prices = serializers.ListField(child=serializers.FloatField())
    opens = serializers.ListField(child=serializers.FloatField())
    highs = serializers.ListField(child=serializers.FloatField())
    lows = serializers.ListField(child=serializers.FloatField())
    volumes = serializers.ListField(child=serializers.IntegerField())
    price_high = serializers.FloatField(allow_null=True)
    price_low = serializers.FloatField(allow_null=True)
    avg_volume = serializers.FloatField()
