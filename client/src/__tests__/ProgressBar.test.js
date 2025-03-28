import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressBar from '../components/ProgressBar';

describe('ProgressBar Component', () => {
  test('renders the progress bar with correct label and values', () => {
    render(<ProgressBar label="Progress" label2="Value: " value={30} max={100} />);

    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Value: 30/100')).toBeInTheDocument();
  });

  test('renders the progress bar with green color when value is less than 50%', () => {
    render(<ProgressBar label="Progress" label2="Value: " value={30} max={100} />);

    const progressBarFill = document.querySelector('.progress-bar-fill');
    expect(progressBarFill).toHaveStyle('width: 30%');
    expect(progressBarFill).toHaveStyle('background-color: #00ff33');
  });

  test('renders the progress bar with yellow color when value is between 50% and 75%', () => {
    render(<ProgressBar label="Progress" label2="Value: " value={60} max={100} />);

    const progressBarFill = document.querySelector('.progress-bar-fill');
    expect(progressBarFill).toHaveStyle('width: 60%');
    expect(progressBarFill).toHaveStyle('background-color: #ffcc00');
  });

  test('renders the progress bar with red color when value is greater than 75%', () => {
    render(<ProgressBar label="Progress" label2="Value: " value={80} max={100} />);

    const progressBarFill = document.querySelector('.progress-bar-fill');
    expect(progressBarFill).toHaveStyle('width: 80%');
    expect(progressBarFill).toHaveStyle('background-color: #ff3300');
  });
});