from rest_framework import serializers

class ModelTrainingParamSerializer(serializers.Serializer):
    ticker = serializers.CharField(default="GOOGL", max_length=10)
    n_estimators = serializers.IntegerField(default=100, min_value=10, max_value=500)
    max_depth = serializers.IntegerField(default=10, min_value=1, max_value=50)
    random_state = serializers.IntegerField(default=42, min_value=0, max_value=9999)
    start_date = serializers.CharField(default="2000-01-01")
    end_date = serializers.CharField(default="2025-03-31")

class BatchTrainingParamSerializer(serializers.Serializer):
    start_date = serializers.CharField(default="2000-01-01")
    end_date = serializers.CharField(default="2025-03-31")
    n_estimators = serializers.IntegerField(default=100, min_value=10, max_value=500)
    max_depth = serializers.IntegerField(default=10, min_value=1, max_value=50)
    random_state = serializers.IntegerField(default=42, min_value=0, max_value=9999)

class TrainingProgressSerializer(serializers.Serializer):
    stage = serializers.CharField()
    percentage = serializers.IntegerField()
