import React, { useState } from "react";
import "../design/Card.css";

export default function Card({ rank, suit, delay, className }) {
  const suitMap = { hearts: "H", diamonds: "D", clubs: "C", spades: "S" };
  const rankMap = { Ace: "A", Jack: "J", Queen: "Q", King: "K" };
  const displayRank = rankMap[rank] || rank.toString(); // Handle face cards
  const imageName = `${displayRank}${suitMap[suit]}.png`;
  const [selected, setSelected] = useState(false);

  // to select poker cards to play their hand
  const handleClick = () => {
    setSelected(!selected);
  };

  return (
    <div className="blackjack-card-container" style={{ animationDelay: `${delay}s` }}>
      <img
        src={`/cards/${imageName}`}
        alt={`${rank} of ${suit}`}
        className={`poker-card-img ${className} ${selected ? "selected" : ""}`}
        onClick={handleClick}
      />
    </div>
  );
}
