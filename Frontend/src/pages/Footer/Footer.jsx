import React from 'react';
import { Globe, Activity } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-bar">
      <div className="footer-content">
        <div className="footer-left">
          <Activity size={16} className="text-green" />
          <span>Stock Price Prediction System &copy; {new Date().getFullYear()}</span>
        </div>

        <div className="footer-right">
          <a
            href="https://github.com/felixmburudev/Safaricom-Stock-Price-Prediction-System/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <Globe size={15} />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
