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
      }  else if (prevSelectedCards.length < 5) { // can only select 5 cards at a time
        return [...prevSelectedCards, card];
      } else {
        return prevSelectedCards;
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

  // log the selected cards for debugging purposes
  console.log("Selected Cards:", selectedCards);

  return (
    <div className="poker-container">
      <div className="poker-card">
        {!gameStarted && (
          <>
            <h1>♠️ Poker Minigame ♥️</h1>
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
