import React, { useState } from 'react';
import { Cpu, Layers } from 'lucide-react';
import TrainingComponent from '../../components/Training/TrainingComponent';
import TrainingManyComponent from '../../components/Training/TrainingManyComponent';
import './Tr_Styles.css';

function Training() {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <div className="training-page">
      <div className="pro-card training-header">
        <h1 className="title-green">Model Training Workbench</h1>
        <p className="subtitle">Configure parameters and train Random Forest models using backend DRF endpoints</p>

        {/* Tab Headers */}
        <div className="tab-headers">
          <button
            className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            <Cpu size={16} />
            <span>Single Stock Model</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            <Layers size={16} />
            <span>Batch Training</span>
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'single' && <TrainingComponent />}
        {activeTab === 'batch' && <TrainingManyComponent />}
      </div>
    </div>
  );
}

export default Training;
