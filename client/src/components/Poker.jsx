import React, { useState } from "react";
import "../design/Poker.css";
import { Link } from "react-router-dom";
import Card from "./Card.jsx";

const Poker = () => {
  const [playerHand, setPlayerHand] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [gameID, setgameID] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);

  const startGame = async () => {
    const response = await fetch("http://localhost:5050/poker/start");
    const data = await response.json();
    setgameID(data.gameID);
    setPlayerHand(data.playerHand);
    setGameStarted(true);
    setCurrentScore(0);
    console.log(data.gameID);
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

  const discardCards = async () => {
    const remainingCards = playerHand.filter(
      (card) =>
        !selectedCards.some(
          (selectedCard) => selectedCard.rank === card.rank && selectedCard.suit === card.suit
        )
    );
    

    const response = await fetch(`http://localhost:5050/poker/draw?gameID=${gameID}&count=${selectedCards.length}`,);

    const data = await response.json();

    setPlayerHand([...remainingCards, ...data.newCards]);
    setSelectedCards([]);
  };

  const playHand = async () => {
    if (selectedCards.length === 0) {
        console.error("No cards selected to play");
        return;
    }

    try {
        const response = await fetch("http://localhost:5050/poker/score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                gameID,
                selectedCards,
            }),
        });

        const data = await response.json();

        if (data.score) {
            console.log("Score for the played hand:", data.score);
            alert(`Your hand scored: ${data.score}`);
            setCurrentScore(data.currentScore);
        } else {
            console.error("Failed to score hand:", data.error);
        }

        // Remove the selected cards from the player's hand
        const remainingCards = playerHand.filter(
            (card) =>
                !selectedCards.some(
                    (selectedCard) => selectedCard.rank === card.rank && selectedCard.suit === card.suit
                )
        );

        // Get new cards to replace the discarded ones
        const drawResponse = await fetch(
            `http://localhost:5050/poker/draw?gameID=${gameID}&count=${selectedCards.length}`
        );
        const drawData = await drawResponse.json();

        setPlayerHand([...remainingCards, ...drawData.newCards]);
        setSelectedCards([]);
    } catch (error) {
        console.error("Error playing hand:", error);
    }
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
            <p>Welcome to the Poker Minigame! Click "Start Game" to begin.</p>
            <p>
              Check out our{" "}
              <Link to="/tutorials" className="tutorials-link">
                tutorials
              </Link>{" "}
              section for more information on how to play the game!
            </p>
            <div className="button-group">
              <button onClick={startGame} className="start-game">
                Start Game
              </button>
              <Link to="/" className="back-to-home">
                Back to Home
              </Link>
            </div>
          </>
        )}
        {gameStarted && (
          <>
            <h1>Your Hand</h1>
            <div className="hand">{renderHand(playerHand)}</div>
            <h2>Current Score: {currentScore}</h2>
          </>
        )}
      </div>
      {gameStarted && ( // Put this outside other divs so the buttons are below the cards
        <div className="action-buttons-poker">
          <button onClick={discardCards} className="discard">
            Discard
          </button>
          <button onClick={playHand} className="play-hand">
            Play Hand
          </button>
        </div>
      )}
    </div>
  );
};

export default Poker;
