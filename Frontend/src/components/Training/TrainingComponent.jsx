import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Play, AlertTriangle } from 'lucide-react';
import companies from './companies';
import './Training_styles.css';

const TrainingComponent = () => {
  const [progress, setProgress] = useState({ stage: 'Not started', percentage: 0 });
  const [isTraining, setIsTraining] = useState(false);
  const [ticker, setTicker] = useState('GOOGL');
  const [nEstimators, setNEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(10);
  const [randomState, setRandomState] = useState(42);
  const [startDate, setStartDate] = useState("2000-01-01");
  const [endDate, setEndDate] = useState("2025-03-31");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isTraining) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('http://localhost:8000/api/progress/');
          if (res.ok) {
            const data = await res.json();
            setProgress(data);
            if (data.percentage >= 100) {
              setIsTraining(false);
              clearInterval(interval);
            }
          }
        } catch (e) {}
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isTraining]);

  const handleTrain = async () => {
    if (!ticker.trim()) return;
    setIsTraining(true);
    setError(null);
    setProgress({ stage: 'Initializing training workflow...', percentage: 5 });

    try {
      const query = `ticker=${encodeURIComponent(ticker)}&n_estimators=${nEstimators}&max_depth=${maxDepth}&random_state=${randomState}&start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(`http://localhost:8000/api/train/?${query}`);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setProgress({ stage: 'Model trained successfully!', percentage: 100 });
        setTimeout(() => {
          navigate(`/predict/${ticker}`);
        }, 1200);
      } else {
        throw new Error(data.message || 'Model training failed');
      }
    } catch (err) {
      setError(err.message || 'Error occurred during model execution');
      setIsTraining(false);
      setProgress({ stage: 'Training aborted', percentage: 0 });
    }
  };

  return (
    <div className="pro-card training-panel">
      <div className="panel-title-bar">
        <Cpu className="text-green" size={22} />
        <div>
          <h3>Single Model Training</h3>
          <p className="text-muted">Train a Random Forest model on historical stock features</p>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Inputs Form */}
      <div className="training-form-grid">
        <div className="form-group">
          <label>Stock Symbol</label>
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            disabled={isTraining}
          >
            <option value="">Select a stock...</option>
            {companies.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Trees Count (n_estimators)</label>
          <input
            type="number"
            min={10}
            max={500}
            value={nEstimators}
            onChange={(e) => setNEstimators(parseInt(e.target.value) || 100)}
            disabled={isTraining}
          />
        </div>

        <div className="form-group">
          <label>Max Tree Depth (max_depth)</label>
          <input
            type="number"
            min={1}
            max={50}
            value={maxDepth}
            onChange={(e) => setMaxDepth(parseInt(e.target.value) || 10)}
            disabled={isTraining}
          />
        </div>

        <div className="form-group">
          <label>Random Seed (random_state)</label>
          <input
            type="number"
            min={0}
            max={9999}
            value={randomState}
            onChange={(e) => setRandomState(parseInt(e.target.value) || 42)}
            disabled={isTraining}
          />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isTraining}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isTraining}
          />
        </div>
      </div>

      <div className="action-row">
        <button
          onClick={handleTrain}
          disabled={isTraining || !ticker}
          className="btn-primary"
        >
          {isTraining ? <Cpu className="spin" size={16} /> : <Play size={16} />}
          <span>{isTraining ? 'Training Model...' : 'Start Training'}</span>
        </button>
      </div>

      {/* Progress Monitor */}
      <div className="progress-section">
        <div className="progress-label-bar">
          <span className="stage-name">{progress.stage}</span>
          <span className="stage-pct">{progress.percentage}%</span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TrainingComponent;
