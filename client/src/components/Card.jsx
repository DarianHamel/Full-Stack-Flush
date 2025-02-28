import React from "react";
import "../design/Card.css";

export default function Card({ rank, suit, delay }) {
  const suitMap = { hearts: "H", diamonds: "D", clubs: "C", spades: "S" };
  const rankMap = { Ace: "A", Jack: "J", Queen: "Q", King: "K" };
  const displayRank = rankMap[rank] || rank.toString(); // Handle face cards
  const imageName = `${displayRank}${suitMap[suit]}.png`;

  return (
    <div className="blackjack-card-container" style={{ animationDelay: `${delay}s` }}>
      <img src={`/cards/${imageName}`} alt={`${rank} of ${suit}`} className="blackjack-card-img" />
    </div>
  );
}
