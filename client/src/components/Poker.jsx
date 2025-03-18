import React, { useState } from "react";
import "../design/Poker.css";
import { Link } from "react-router-dom";
import Card from "./Card.jsx";

const Poker = () => {
  const [playerHand, setPlayerHand] = useState([]);
  const [scoredHand, setScoredHand] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);

  const startGame = async () => {
    const response = await fetch("http://localhost:5050/poker/start");
    const data = await response.json();
    setPlayerHand(data.playerHand.map(changeCard));
    setGameStarted(true);
  };

  const changeCard = (card) => {
    if (card.rank === 14) {
      card.rank = "Ace";
    } else if (card.rank === 11) {
      card.rank = "Jack";
    } else if (card.rank === 12) {
      card.rank = "Queen";
    } else if (card.rank === 13) {
      card.rank = "King";
    }
    return card;
  };

  const handleCardClick = (card) => {
    setSelectedCards((prevSelectedCards) => {
      const isSelected = prevSelectedCards.some(
        (selectedCard) => selectedCard.rank === card.rank && selectedCard.suit === card.suit
      );
      if (isSelected) {
        return prevSelectedCards.filter(
          (selectedCard) => selectedCard.rank !== card.rank || selectedCard.suit !== card.suit
        );
      } else {
        return [...prevSelectedCards, card];
      }
    });
  };

  const renderHand = (hand) => {
    return (
      <div className="card-row">
        {hand.map((card, index) => (
          <Card
            key={index}
            rank={card.rank}
            suit={card.suit}
            delay={index * 0.3}
            className="poker-card-img"
            onClick={() => handleCardClick(card)}
            selected={selectedCards.some(
              (selectedCard) => selectedCard.rank === card.rank && selectedCard.suit === card.suit
            )}
          />
        ))}
      </div>
    );
  };

  // Log the selected cards for debugging
  console.log("Selected Cards:", selectedCards);

  return (
    <div className="poker-container">
      <div className="poker-card">
        {!gameStarted && (
          <>
            <h1>Coming Soon!</h1>
            <h1>♠️ Poker Game ♥️</h1>
            <p>
              We’re working hard to bring you an immersive poker experience with the same commitment 
              to responsible gambling. Stay tuned for exciting features, strategic gameplay, 
              and ethical gambling options — all coming your way soon!
            </p>
            <button onClick={startGame} className="start-game">
              Start Game
            </button>
          </>
        )}
        {gameStarted && (
          <>
            <h1>Your Hand</h1>
            <div className="hand">{renderHand(playerHand)}</div>
          </>
        )}
        <Link to="/" className="back-to-home">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Poker;
