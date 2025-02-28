import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Resources from "../components/Resources";


describe("Resources Component", () => {
  test("renders the Resources component", () => {
    render(
    <Router>
        <Resources />
    </Router>
    );
    expect(screen.getByText("Gambling Resources")).toBeInTheDocument();
  });
});
