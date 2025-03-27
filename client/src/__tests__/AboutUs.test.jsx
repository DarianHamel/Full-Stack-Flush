import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import AboutUs from "../components/AboutUs";


describe("AboutUs Component - Unit tests", () => {
  test("renders the AboutUs component", () => {
    render(
    <Router>
        <AboutUs />
    </Router>
    );
    
    expect(screen.getByText("About Full Stack Flush")).toBeInTheDocument();
    expect(screen.getByText("Meet Our Team")).toBeInTheDocument();
  });

  test("renders the vision statement", () => {
    render(
      <Router>
        <AboutUs />
      </Router>
    );

    expect(screen.getByText(/is more than just a gambling web application/i)).toBeInTheDocument();
    expect(screen.getByText(/responsible gambling should be the standard, not the exception/i)).toBeInTheDocument();
  });

  test("renders all team members", () => {
    render(
      <Router>
        <AboutUs />
      </Router>
    );

    const teamMembers = [
      "Mateo DeSousa", "Kaye Mendoza", "Darian Hamel",
      "Prashant Nigam", "Scott Barrett", "Chineze Obi"
    ];

    teamMembers.forEach(member => {
      expect(screen.getByText(member)).toBeInTheDocument();
    });
  });

  test("mentions responsible gambling features", () => {
    render(
      <Router>
        <AboutUs />
      </Router>
    );

    expect(screen.getByText(/mandatory betting and time limits/i)).toBeInTheDocument();
    expect(screen.getByText(/regular reminders/i)).toBeInTheDocument();
  });
});
