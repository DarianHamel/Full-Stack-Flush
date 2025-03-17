import React from 'react';
import '../design/ProgressBar.css';

const ProgressBar = ({ label, value, max }) => {
  const percentage = (value / max) * 100;

  let color;
  if (percentage < 50) {
    color = '#00ff33'; // Green
  } else if (percentage < 75) {
    color = '#ffcc00'; // Yellow
  } else {
    color = '#ff3300'; // Red
  }

  return (
    <div className="progress-bar">
      <label>{label}</label>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${percentage}%` , backgroundColor: color}}></div>
      </div>
      <span>{value}/{max}</span>
    </div>
  );
};

export default ProgressBar;