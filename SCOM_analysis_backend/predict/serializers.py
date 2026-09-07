from rest_framework import serializers

class PredictionInputSerializer(serializers.Serializer):
    ticker = serializers.CharField(required=True, max_length=10)

class PredictionOutputSerializer(serializers.Serializer):
    ticker = serializers.CharField()
    prediction = serializers.IntegerField(help_text="0 for Bearish/Down, 1 for Bullish/Up")
    signal = serializers.CharField(help_text="BUY or SELL")
    probability_class_0 = serializers.FloatField(help_text="Probability of Down move")
    probability_class_1 = serializers.FloatField(help_text="Probability of Up move")
    latest_close = serializers.FloatField(required=False, allow_null=True)
    rsi = serializers.FloatField(required=False, allow_null=True)
    sma_20 = serializers.FloatField(required=False, allow_null=True)
    sma_50 = serializers.FloatField(required=False, allow_null=True)
