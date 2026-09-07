import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import axios from 'axios';
import companies from '../../components/Training/companies';
import { Cpu, ArrowUpCircle, ArrowDownCircle, Activity, Gauge, BarChart3, AlertCircle } from 'lucide-react';
import './Prediction.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Prediction() {
  const { ticker: urlTicker } = useParams();
  const [ticker, setTicker] = useState(urlTicker || 'GOOGL');
  const [stockData, setStockData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState(null);

  const POLYGON_API_KEY = 'EYYzOPgbR0i2T9W_CmvyrDOLl0B9tEKP';

  useEffect(() => {
    if (!ticker) return;

    const fetchStockAndCompany = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const stockResp = await axios.get(`http://localhost:8000/api/stock_data/?ticker=${ticker}`);
        setStockData(stockResp.data);

        try {
          const compResp = await axios.get(
            `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`
          );
          setCompanyData(compResp.data?.results || null);
        } catch (e) {
          setCompanyData(null);
        }
      } catch (err) {
        setError(`Failed to fetch stock data for ${ticker}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockAndCompany();
  }, [ticker]);

  const handlePredict = async () => {
    if (!ticker) return;
    setIsPredicting(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:8000/api/predict/?ticker=${ticker}`);
      setPredictionData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate prediction');
    } finally {
      setIsPredicting(false);
    }
  };

  const getExtendedData = () => {
    if (!stockData) return [];
    const prices = stockData.prices;
    if (!prices || prices.length === 0) return [];
    const lastPrice = prices[prices.length - 1];

    let forecastedPrice = lastPrice;
    if (predictionData?.prediction === 1) {
      forecastedPrice = lastPrice * 1.045;
    } else if (predictionData?.prediction === 0) {
      forecastedPrice = lastPrice * 0.955;
    }

    const extensionLength = 10;
    const extension = new Array(extensionLength).fill(null);
    extension[extensionLength - 1] = forecastedPrice;

    return [...prices, ...extension];
  };

  const chartData = stockData ? {
    labels: [
      ...stockData.dates,
      ...Array.from({ length: 10 }, (_, i) => `Day +${i + 1}`)
    ],
    datasets: [
      {
        label: `${ticker} Price History & Projection`,
        data: getExtendedData(),
        borderColor: predictionData?.prediction === 1
          ? '#00a86b'
          : predictionData?.prediction === 0
          ? '#dc2626'
          : '#475569',
        backgroundColor: predictionData?.prediction === 1
          ? 'rgba(0, 168, 107, 0.08)'
          : predictionData?.prediction === 0
          ? 'rgba(220, 38, 38, 0.08)'
          : 'rgba(71, 85, 105, 0.08)',
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 5,
      }
    ]
  } : null;

  return (
    <div className="prediction-container-page">
      {/* Header Selector Card */}
      <div className="pro-card prediction-header-card">
        <div className="header-left">
          <Cpu className="text-green" size={26} />
          <div>
            <h1 className="title-green">Stock Price Prediction</h1>
            <p className="subtitle">Random Forest machine learning model evaluation via DRF API</p>
          </div>
        </div>

        <div className="header-right">
          <label>Select Symbol:</label>
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="ticker-dropdown"
          >
            {companies.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} - {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={handlePredict}
            className="btn-primary"
            disabled={isPredicting || isLoading}
          >
            {isPredicting ? 'Executing Model...' : 'Run Prediction'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Company Info Banner */}
      {companyData && (
        <div className="pro-card company-info-card">
          {companyData.branding?.logo_url && (
            <img
              src={`${companyData.branding.logo_url}?apiKey=${POLYGON_API_KEY}`}
              alt={`${companyData.name} logo`}
              className="company-logo"
            />
          )}
          <div>
            <h3>{companyData.name} ({ticker})</h3>
            <p className="text-muted">{companyData.description || 'Publicly traded security.'}</p>
          </div>
        </div>
      )}

      {/* Prediction Metrics & Cards */}
      {predictionData && (
        <div className="prediction-results-grid">
          <div className="pro-card signal-card">
            <div className="signal-header">
              <span>Forecasted Direction</span>
              <Gauge className="text-green" size={18} />
            </div>

            <div className="signal-body">
              {predictionData.prediction === 1 ? (
                <div className="signal-badge bull">
                  <ArrowUpCircle size={28} />
                  <div>
                    <span className="signal-title">BULLISH (BUY)</span>
                    <span className="signal-desc">Upward price movement predicted</span>
                  </div>
                </div>
              ) : (
                <div className="signal-badge bear">
                  <ArrowDownCircle size={28} />
                  <div>
                    <span className="signal-title">BEARISH (SELL)</span>
                    <span className="signal-desc">Downward price movement predicted</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pro-card confidence-card">
            <div className="stat-header">
              <span>Model Probabilities</span>
              <BarChart3 className="text-green" size={18} />
            </div>

            <div className="confidence-bars">
              <div className="prob-item">
                <div className="prob-label">
                  <span className="green-text">Bullish Probability</span>
                  <span>{(predictionData.probability_class_1 * 100).toFixed(1)}%</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill bull-fill"
                    style={{ width: `${predictionData.probability_class_1 * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="prob-item">
                <div className="prob-label">
                  <span className="red-text">Bearish Probability</span>
                  <span>{(predictionData.probability_class_0 * 100).toFixed(1)}%</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill bear-fill"
                    style={{ width: `${predictionData.probability_class_0 * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pro-card indicators-card">
            <div className="stat-header">
              <span>Technical Metrics</span>
              <Activity className="text-green" size={18} />
            </div>
            <div className="indicators-grid">
              <div className="ind-item">
                <span className="ind-label">Latest Close</span>
                <span className="ind-val">${predictionData.latest_close?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="ind-item">
                <span className="ind-label">RSI (14)</span>
                <span className="ind-val">{predictionData.rsi?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="ind-item">
                <span className="ind-label">SMA (20)</span>
                <span className="ind-val">${predictionData.sma_20?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="ind-item">
                <span className="ind-label">SMA (50)</span>
                <span className="ind-val">${predictionData.sma_50?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projection Chart */}
      {chartData && (
        <div className="pro-card chart-card">
          <div className="chart-header">
            <h2>{ticker} Price Movement & Model Prediction Chart</h2>
          </div>
          <div className="chart-wrapper">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#ffffff',
                    titleColor: '#0f172a',
                    bodyColor: '#00a86b',
                    borderColor: '#cbd5e1',
                    borderWidth: 1,
                  },
                },
                scales: {
                  x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
                  y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Prediction;