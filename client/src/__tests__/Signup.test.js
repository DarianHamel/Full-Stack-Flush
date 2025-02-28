import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Signup from '../components/Signup';


describe('Signup Component', () => {
  test('renders signup component when show is true', () => {
    render(
      <Router>
        <Signup show = {true}/>
      </Router>
    );

    // Add assertions to verify the rendered output
    expect(screen.getByText('Username:')).toBeInTheDocument();
    expect(screen.getByText("Register Now!")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  test("does not render the signup component when show is false", () => {
    render(
      <Router>
        <Signup show={false} />
      </Router>
    );

    expect(screen.queryByText("Register Now!")).not.toBeInTheDocument();
  });
});