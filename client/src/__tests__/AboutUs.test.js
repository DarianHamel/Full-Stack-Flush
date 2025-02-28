import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import AboutUs from "../components/AboutUs";


describe("AboutUs Component", () => {
  test("renders the AboutUs component", () => {
    render(
    <Router>
        <AboutUs />
    </Router>
    );
    
    expect(screen.getByText("About Full Stack Flush")).toBeInTheDocument();
    expect(screen.getByText("Meet Our Team")).toBeInTheDocument();
  });
});
