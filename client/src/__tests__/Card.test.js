import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Card from "../components/Card";

describe("Card Component", () => {
  test("renders the card with correct image and alt text", () => {
    render(<Card rank="Ace" suit="hearts" delay={0} onClick={() => {}} selected={false} />);
    
    const cardImage = screen.getByAltText("Ace of hearts");
    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute("src", "/cards/AH.png");
  });

  test("applies the selected class when selected is true", () => {
    render(<Card rank="King" suit="spades" delay={0} onClick={() => {}} selected={true} />);
    
    const cardImage = screen.getByAltText("King of spades");
    expect(cardImage).toHaveClass("selected");
  });

  test("calls onClick when the card is clicked", () => {
    const handleClick = jest.fn();
    render(<Card rank="Queen" suit="diamonds" delay={0} onClick={handleClick} selected={false} />);
    
    const cardImage = screen.getByAltText("Queen of diamonds");
    fireEvent.click(cardImage);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies the correct animation delay", () => {
    render(<Card rank="Jack" suit="clubs" delay={2} onClick={() => {}} selected={false} />);
    
    const cardContainer = screen.getByAltText("Jack of clubs").parentElement;
    expect(cardContainer).toHaveStyle("animation-delay: 2s");
  });
});