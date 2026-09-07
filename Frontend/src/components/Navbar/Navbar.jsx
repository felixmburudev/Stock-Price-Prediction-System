import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Cpu, Activity, Info, Menu, X, ShieldCheck } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" onClick={handleLinkClick} className="navbar-brand">
          <div className="brand-icon">
            <TrendingUp size={22} className="text-green" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Stock Prediction System</span>
            <span className="brand-subtitle">Django REST & Machine Learning</span>
          </div>
        </Link>

        {/* Security & System Live Status Badge */}
        <div className="system-status-badge">
          <ShieldCheck size={15} />
          <span>DRF API Rate-Limited (HTTPS Secure)</span>
        </div>

        <button
          className="mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link
            to="/"
            onClick={handleLinkClick}
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
          >
            <Activity size={17} />
            <span>Home</span>
          </Link>

          <Link
            to="/training"
            onClick={handleLinkClick}
            className={`nav-item ${isActive('/training') ? 'active' : ''}`}
          >
            <Cpu size={17} />
            <span>Training</span>
          </Link>

          <Link
            to="/predict"
            onClick={handleLinkClick}
            className={`nav-item ${isActive('/predict') ? 'active' : ''}`}
          >
            <TrendingUp size={17} />
            <span>Prediction</span>
          </Link>

          <Link
            to="/about"
            onClick={handleLinkClick}
            className={`nav-item ${isActive('/about') ? 'active' : ''}`}
          >
            <Info size={17} />
            <span>About</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;