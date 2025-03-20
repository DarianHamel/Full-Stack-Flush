import React, { useState } from "react";
import "../design/Poker.css";
import { Link } from "react-router-dom";
import Card from "./Card.jsx";
import AuthRedirect from "./AuthRedirect";

const Poker = ({ username }) => {
  const [playerHand, setPlayerHand] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [gameID, setgameID] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [handsRemaining, setHandsRemaining] = useState(0);
  const [discardsRemaining, setDiscardsRemaining] = useState(0);
  const [gameOver, setGameOver] = useState(false); // Track if the game is over
  const [difficulty, setDifficulty] = useState("easy");
  const [targetScore, setTargetScore] = useState(0);
  const [difficultySelected, setDifficultySelected] = useState(false); // for resetting difficulty select after game ends
  const [betAmount, setBetAmount] = useState(0);
  console.log(username);

  const startGame = async () => {
    if (betAmount <= 0) {
      alert("Please place a valid bet!");
      return;
    }

    console.log("Placing bet with:", {
      username,
      amount: betAmount,
    });

    const betResponse = await fetch("http://localhost:5050/bet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username, // Pass the logged-in user's username
        money: betAmount, // Deduct the bet amount
      }),
    });

    const response = await fetch("http://localhost:5050/poker/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ difficulty }), // Send the selected difficulty
    });

    const data = await response.json();
    console.log("Start Game Response:", data); // Debugging

    setgameID(data.gameID);
    setPlayerHand(data.playerHand);
    setHandsRemaining(data.handsRemaining || 0);
    setDiscardsRemaining(data.discardsRemaining || 0);
    setGameStarted(true);
    setGameOver(false); // Reset game over state
    setSelectedCards([]); // Reset selected cards
    setCurrentScore(0);
    setTargetScore(data.targetScore); // Set the target score from the backend
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
    if (discardsRemaining <= 0) {
      alert("No discards remaining.");
      return;
    }

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
    setDiscardsRemaining(discardsRemaining - 1);
  };

  const playHand = async () => {
    if (selectedCards.length === 0) {
        alert("No cards selected to play!");
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

        if (data.handsRemaining === 0) {
          const finalScore = data.currentScore;
            setCurrentScore(finalScore);
            setGameOver(true);
            setHandsRemaining(0);

            const gameResult = finalScore >= targetScore;

            let multiplier = 1;
            if (difficulty === "medium") { multiplier = 2;
            } else if (difficulty === "hard") { multiplier = 3; }

            const winnings = gameResult ? betAmount * multiplier : 0;

            if (gameResult) {
              const balanceResponse = await fetch("http://localhost:5050/update-balance-no-password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  username, // Pass the logged-in user's username
                  amount: winnings,
                }),
              });
              const balanceData = await balanceResponse.json();

              if (!balanceData.success) {
                alert(balanceData.message);
              } else {
                alert(`You won $${winnings}`);
              }
            } 
            else {
                alert(`You lost $${betAmount}`);
              }

            // Update stats in the backend
            await fetch("http://localhost:5050/updateStats", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username, // Pass the logged-in user's username
                wins: gameResult ? 1 : 0,
                losses: gameResult ? 0 : 1,
                money: betAmount
              }),
            });

            return;
        }

        if (data.score) {
            alert(`Your hand scored: ${data.score}`);
            setCurrentScore(data.currentScore);
            setHandsRemaining(data.handsRemaining);
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
  console.log(gameOver);


  // TODO: track time and money spent on poker
  return (
    <AuthRedirect username = {username}>
      <div className="poker-container">
        <div className="poker-card">
          {!difficultySelected && (
            <>
              <h1>♠️ Poker Minigame ♥️</h1>
              <p>Welcome to the Poker Minigame! Select a difficulty and place your bet to begin.</p>
              <div className="difficulty-selection">
                <label htmlFor="difficulty">Select Difficulty:</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={difficulty}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setDifficulty(e.target.value);
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="betting-selection">
                <label htmlFor="betAmount">Place Your Bet:</label>
                <input
                  type="number"
                  id="betAmount"
                  name="betAmount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min="1"
                  placeholder="Enter your bet"
                />
              </div>
              <div className="button-group">
                <button onClick={() => {
                  if (betAmount <= 0) {
                    alert("Please place a valid bet!");
                    return;
                  }
                  setDifficultySelected(true);
                  startGame();
                }} className="start-game">
                  Start Game
                </button>
                <Link to="/" className="back-to-home">
                  Back to Home
                </Link>
              </div>
            </>
          )}
          {gameStarted && !gameOver && (
            <>
              <h1>Your Hand</h1>
              <div className="hand">{renderHand(playerHand)}</div>
              <h2>Current Score: {currentScore}</h2>
              <h2>Target Score: {targetScore}</h2>
              <p>Hands Remaining: {handsRemaining}</p>
              <p>Discards Remaining: {discardsRemaining}</p>
            </>
          )}
          {gameOver && (
            <>
              <h1>Game Over!</h1>
              <p>Your final score: {currentScore}</p>
              {currentScore >= targetScore ? (
                <p>Congratulations! You win!</p>
              ) : (
                <p>Sorry, you lose. Better luck next time!</p>
              )}
              <button
                onClick={() => {
                  setGameOver(false);
                  setGameStarted(false);
                  setDifficultySelected(false);
                  setPlayerHand([]);
                  setCurrentScore(0);
                  setHandsRemaining(0);
                  setDiscardsRemaining(0);
                  setSelectedCards([]); 
                }}
                className="start-game"
              >
                End Game
              </button>
            </>
          )}
        </div>
        {gameStarted && !gameOver && ( // Put this outside other divs so the buttons are below the cards
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
    </AuthRedirect>
  );
};

export default Poker;
