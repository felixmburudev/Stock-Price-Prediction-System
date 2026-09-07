import React, { useEffect, useState } from 'react';
import './HomePage.css';
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
import { Search, TrendingUp, TrendingDown, BarChart2, Layers, Cpu } from 'lucide-react';
import companies from '../../components/Training/companies';
import { useNavigate } from 'react-router-dom';

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

const DEFAULT_POPULAR_STOCKS = ['GOOGL', 'AAPL', 'MSFT', 'NVDA', 'AMZN', 'TSLA'];

const HomePage = () => {
  const [ticker, setTicker] = useState('GOOGL');
  const [activeTicker, setActiveTicker] = useState('GOOGL');
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState(null);
  const [stockStats, setStockStats] = useState(null);
  const [stockTableData, setStockTableData] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchStockData = async (symbolToFetch) => {
    setLoading(true);
    setError('');
    const targetSymbol = (symbolToFetch || ticker).toUpperCase();

    try {
      const response = await fetch(`http://localhost:8000/api/stock_data/?ticker=${encodeURIComponent(targetSymbol)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${targetSymbol}`);
      }

      const data = await response.json();
      if (!data.dates || !data.prices) {
        throw new Error('Invalid dataset response format');
      }

      setActiveTicker(targetSymbol);
      setStockStats({
        high: data.price_high,
        low: data.price_low,
        avgVolume: data.avg_volume,
        latestPrice: data.prices[data.prices.length - 1],
        totalBars: data.dates.length,
      });

      setChartData({
        labels: data.dates,
        datasets: [
          {
            label: `${targetSymbol} Price ($)`,
            data: data.prices,
            borderColor: '#00a86b',
            backgroundColor: 'rgba(0, 168, 107, 0.08)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#00a86b',
            tension: 0.1,
            fill: true,
          },
        ],
      });

      const fullData = data.dates.map((date, idx) => ({
        date,
        open: data.opens[idx],
        high: data.highs[idx],
        low: data.lows[idx],
        close: data.prices[idx],
        volume: data.volumes[idx],
      }));

      setStockTableData(fullData.slice(-30).reverse());

    } catch (err) {
      setError(err.message || 'Error fetching stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData('GOOGL');

    setGainers([
      { symbol: 'NVDA', name: 'NVIDIA Corp', price: 135.40, change: '+5.42%' },
      { symbol: 'AMZN', name: 'Amazon.com', price: 188.20, change: '+3.15%' },
      { symbol: 'MSFT', name: 'Microsoft', price: 448.90, change: '+2.80%' },
      { symbol: 'GOOGL', name: 'Alphabet Inc', price: 176.30, change: '+1.94%' },
    ]);
    setLosers([
      { symbol: 'TSLA', name: 'Tesla Inc', price: 210.10, change: '-3.85%' },
      { symbol: 'INTC', name: 'Intel Corp', price: 20.45, change: '-2.90%' },
      { symbol: 'PYPL', name: 'PayPal Holdings', price: 64.20, change: '-1.75%' },
    ]);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      fetchStockData(ticker.trim());
    }
  };

  const handleChipClick = (symbol) => {
    setTicker(symbol);
    fetchStockData(symbol);
  };

  return (
    <div className="dashboard-container">
      {/* Search Header Banner */}
      <div className="pro-card search-banner">
        <div className="banner-content">
          <h1 className="title-green">Stock Dashboard</h1>
          <p className="subtitle">Real-time stock price analysis and historical metrics powered by Django REST APIs</p>
          
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="input-group">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Enter ticker symbol (e.g. AAPL, MSFT, NVDA)..."
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Fetching...' : 'Fetch Stock Data'}
            </button>
          </form>

          {/* Quick Ticker Chips */}
          <div className="ticker-chips">
            <span className="chips-label">Popular Symbols:</span>
            {DEFAULT_POPULAR_STOCKS.map((sym) => (
              <button
                key={sym}
                onClick={() => handleChipClick(sym)}
                className={`chip-btn ${activeTicker === sym ? 'active' : ''}`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Stock Overview Stat Cards */}
      {stockStats && (
        <div className="stats-grid">
          <div className="pro-card stat-card">
            <div className="stat-header">
              <span>Active Symbol</span>
              <BarChart2 className="text-green" size={18} />
            </div>
            <div className="stat-value">{activeTicker}</div>
            <div className="stat-sub">Latest Close: <span className="green-text">${stockStats.latestPrice?.toFixed(2)}</span></div>
          </div>

          <div className="pro-card stat-card">
            <div className="stat-header">
              <span>Period High</span>
              <TrendingUp className="text-green" size={18} />
            </div>
            <div className="stat-value green-text">${stockStats.high?.toFixed(2)}</div>
            <div className="stat-sub">Highest Period Price</div>
          </div>

          <div className="pro-card stat-card">
            <div className="stat-header">
              <span>Period Low</span>
              <TrendingDown className="text-red" size={18} />
            </div>
            <div className="stat-value red-text">${stockStats.low?.toFixed(2)}</div>
            <div className="stat-sub">Lowest Period Price</div>
          </div>

          <div className="pro-card stat-card">
            <div className="stat-header">
              <span>Average Volume</span>
              <Layers size={18} />
            </div>
            <div className="stat-value">{stockStats.avgVolume?.toLocaleString()}</div>
            <div className="stat-sub">Volume Shares Traded</div>
          </div>
        </div>
      )}

      {/* Main Chart Section */}
      {chartData && (
        <div className="pro-card chart-card">
          <div className="chart-header">
            <div>
              <h2>{activeTicker} Historical Closing Prices</h2>
              <span className="text-muted">Daily price series retrieved from backend API</span>
            </div>
            <button
              onClick={() => navigate(`/predict/${activeTicker}`)}
              className="btn-primary"
            >
              <Cpu size={16} />
              <span>Predict Future Price</span>
            </button>
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
                    padding: 10,
                  },
                },
                scales: {
                  x: {
                    grid: { color: '#f1f5f9' },
                    ticks: { color: '#64748b', maxTicksLimit: 10 },
                  },
                  y: {
                    grid: { color: '#f1f5f9' },
                    ticks: { color: '#64748b' },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Grid for Table & Market Movers */}
      <div className="grid-two-column">
        {/* Recent Data Table */}
        {stockTableData && (
          <div className="pro-card table-card">
            <div className="card-header-title">
              <h3>{activeTicker} Recent Trading Data</h3>
            </div>
            <div className="table-responsive">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Open</th>
                    <th>High</th>
                    <th>Low</th>
                    <th>Close</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {stockTableData.map((row, i) => (
                    <tr key={i}>
                      <td>{row.date}</td>
                      <td>${row.open?.toFixed(2)}</td>
                      <td className="green-text">${row.high?.toFixed(2)}</td>
                      <td className="red-text">${row.low?.toFixed(2)}</td>
                      <td className="font-bold">${row.close?.toFixed(2)}</td>
                      <td className="text-muted">{row.volume?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Market Gainers / Losers */}
        <div className="movers-column">
          <div className="pro-card movers-card">
            <div className="card-header-title">
              <h3 className="green-text">Top Gainers</h3>
            </div>
            <div className="movers-list">
              {gainers.map((stk) => (
                <div
                  key={stk.symbol}
                  onClick={() => handleChipClick(stk.symbol)}
                  className="mover-row clickable"
                >
                  <div>
                    <span className="mover-sym">{stk.symbol}</span>
                    <span className="mover-name">{stk.name}</span>
                  </div>
                  <div className="mover-right">
                    <span className="mover-price">${stk.price.toFixed(2)}</span>
                    <span className="badge badge-success">{stk.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pro-card movers-card">
            <div className="card-header-title">
              <h3 className="red-text">Top Losers</h3>
            </div>
            <div className="movers-list">
              {losers.map((stk) => (
                <div
                  key={stk.symbol}
                  onClick={() => handleChipClick(stk.symbol)}
                  className="mover-row clickable"
                >
                  <div>
                    <span className="mover-sym">{stk.symbol}</span>
                    <span className="mover-name">{stk.name}</span>
                  </div>
                  <div className="mover-right">
                    <span className="mover-price">${stk.price.toFixed(2)}</span>
                    <span className="badge badge-danger">{stk.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
