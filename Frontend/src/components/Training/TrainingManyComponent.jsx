import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Play, AlertTriangle } from 'lucide-react';
import './Training_styles.css';

const TrainingManyComponent = () => {
  const [progress, setProgress] = useState({ stage: 'Not started', percentage: 0 });
  const [isTraining, setIsTraining] = useState(false);
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
    setIsTraining(true);
    setError(null);
    setProgress({ stage: 'Initializing batch queue...', percentage: 5 });

    const queryParams = new URLSearchParams({
      n_estimators: nEstimators.toString(),
      max_depth: maxDepth.toString(),
      random_state: randomState.toString(),
      start_date: startDate,
      end_date: endDate
    });

    try {
      const response = await fetch(`http://localhost:8000/api/train_batch/?${queryParams.toString()}`);
      if (!response.ok) throw new Error(`Server returned status ${response.status}`);
      const data = await response.json();
      if (data.status === 'success') {
        setProgress({ stage: 'Batch processing complete', percentage: 100 });
        setTimeout(() => {
          navigate('/predict');
        }, 1200);
      } else {
        throw new Error(data.message || 'Batch training failed');
      }
    } catch (err) {
      setError(err.message || 'Error occurred during batch training');
      setIsTraining(false);
      setProgress({ stage: 'Batch aborted', percentage: 0 });
    }
  };

  return (
    <div className="pro-card training-panel">
      <div className="panel-title-bar">
        <Layers className="text-green" size={22} />
        <div>
          <h3>Batch Training</h3>
          <p className="text-muted">Train Random Forest ensemble models across AAPL, GOOGL, MSFT, NVDA, AMZN</p>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="batch-symbols-strip">
        <span className="badge badge-success">AAPL</span>
        <span className="badge badge-success">GOOGL</span>
        <span className="badge badge-success">MSFT</span>
        <span className="badge badge-success">NVDA</span>
        <span className="badge badge-success">AMZN</span>
      </div>

      <div className="training-form-grid">
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
          disabled={isTraining}
          className="btn-primary"
        >
          {isTraining ? <Layers className="spin" size={16} /> : <Play size={16} />}
          <span>{isTraining ? 'Training Batch...' : 'Start Batch Training'}</span>
        </button>
      </div>

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

export default TrainingManyComponent;
