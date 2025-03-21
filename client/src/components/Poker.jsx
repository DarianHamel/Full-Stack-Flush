import React, { useState, useEffect } from "react";
import "../design/Poker.css";
import { Link, useNavigate } from "react-router-dom";
import Card from "./Card.jsx";
import AuthRedirect from "./AuthRedirect";
import ProgressBar from "./ProgressBar";
import { checkAndResetDailyValues, updateTimeSpent , fetchUserBalance, fetchUserLimits} from "./helpers/userInfoHelper.js";

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
  // all the limits tracking stuff like how blackjack implements it
  const [timeLimit, setTimeLimit] = useState(0);
  const [moneyLimit, setMoneyLimit] = useState(0);
  const [timePlayed, setTimePlayed] = useState(0);
  const [moneySpent, setMoneySpent] = useState(0);
  const [limitHit, setLimitHit] = useState(false);
  const navigate = useNavigate();
  console.log(username);

  /*
  Calls the functions within on page launch
  Checks the users limits and values and resets on new day
  Gets the user limits and updates const for display
  */
  useEffect(() => {
    checkAndResetDailyValues(username);
    getUserLimits(username);
  }, [username]);

  /*
  Get the limits of the user (on page launch)
  Sets them in their respective consts for checking and displaying
  Locks the user and logs them out if they hit their limits
  */
  const getUserLimits = async (username) => {
    try {
      const limits = await fetchUserLimits(username);
      setTimeLimit(limits.timeLimit || 0);
      setMoneyLimit(limits.moneyLimit || 0);
      setTimePlayed(limits.timeSpent || 0);
      setMoneySpent(limits.moneySpent || 0);
  
      if (limits.moneySpent > limits.moneyLimit || limits.timeSpent >= limits.timeLimit) {
        handleLockOut();
      }
    } catch (error) {
      console.error("Error fetching user limits:", error);
    }
  };

  /*
  Function to lock the user out of playing games as they hit their time to money limit
  Alerts the user and redirects to home page
  */
  const handleLockOut = () => {
    setLimitHit(true);
    alert("You have reached your daily limit and are locked out from playing. Redirecting...", {position: "top-center"});
    setTimeout(() => {
      navigate("/"); // Redirect to the home page
    }, 1000); // Redirect after 3 seconds
  };


  /*
  Start the game of Poker
  */
  const startGame = async () => {
    if (betAmount <= 0) {
      alert("Please place a valid bet!");
      return;
    }

    // Fetch the user's current balance
    const balance = await fetchBalance();
    if (balance === null) {
      return;
    }

    if (limitHit) {
      handleLockOut();
      return;
    }

    if (moneySpent + betAmount > moneyLimit) {
      alert("You have reached your daily money limit!", { position: "top-center" });
      return;
    }
    setGameStarted(true);


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
    setGameOver(false);
    setSelectedCards([]);
    setCurrentScore(0);
    setTargetScore(data.targetScore);

     // Update money spent on the backend
     try {
      const response = await fetch("http://localhost:5050/update-money-spent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          moneySpent: betAmount,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMoneySpent(data.updatedDailyMoneySpent); // Update the frontend with the backend's value
      } else {
        console.error("Failed to update money spent:", data.message);
      }
    } catch (error) {
      console.error("Error updating money spent on the backend:", error);
    }
  };


  /*
  Handles user clicking on cards
  Adds the selected card to the array of selected cards if there is room (max 5)
  */
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


  /*
  Discards the cards selected if user hits the discard card button
  Calls the route /poker/draw
  Input: gameID and the number of cards to be drawn
  Then it sets the hand to be the new cards
  */
  const discardCards = async () => {
    if (limitHit) {
      handleLockOut();
      return;
    }

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


  /*
  Sorts the players hand
  Calls route /poker/sort-hand
  Input: sortBy, either rank or suit
  Returns the sorted hand to display to the player
  */
  const sortHand = async (sortBy) => {
    try {
      const response = await fetch("http://localhost:5050/poker/sort-hand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameID,
          criteria: sortBy,
          hand: playerHand
        }),
      });

      const data = await response.json();
      setPlayerHand(data.sortedHand);
    } catch (error) {
      console.error("Error sorting hand:", error);
    }
  };


  /*
  Plays the currently selected cards
  Calls route /poker/score
  Input: gameID and selected cards
  Returns the score and displays it to the user
  */
  const playHand = async () => {
    if (limitHit) {
      handleLockOut();
      return;
    }

    const startTime = Date.now();

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
                  username,
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
            const statsResponse = await fetch("http://localhost:5050/updateStats", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username, // Pass the logged-in user's username
                wins: gameResult ? 1 : 0,
                losses: gameResult ? 0 : 1,
                money: betAmount,
                game: "Poker"
              }),
            });

            const statsData = await statsResponse.json();
            console.log(statsData);

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

        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - startTime) / 1000); // Time in seconds
        setTimePlayed((prevTimePlayed) => prevTimePlayed + timeSpent);

        await updateTimeSpent(username, timeSpent);

        if (timePlayed + timeSpent >= timeLimit) {
          handleLockOut();
        }
    } catch (error) {
        console.error("Error playing hand:", error);
    }
  };

  /*
  Renders the hand of the user
  */
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

  /*
  Gets the users balance to be tracked for the user's limits
  */
  const fetchBalance = async () => {
    try {
      const response = await fetch(`http://localhost:5050/balance?username=${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      return data.balance;
    } catch (error) {
      console.error("Error fetching balance:", error);
      alert("An error occurred while fetching your balance.");
      return null;
    }
  };

  // log the selected cards for debugging purposes
  console.log("Selected Cards:", selectedCards);
  console.log(gameOver);


  // return the front end UI
  return (
    <AuthRedirect username = {username}>
      <div className="poker-container">
        <div className="Progress-Bars">
          <ProgressBar
            label="Time Played"
            label2="Minutes:"
            value={Math.floor(timePlayed / 60)}
            max={Math.floor(timeLimit / 60) || 1}
          />
          <ProgressBar
            disabled={false}
            label="Money Spent"
            label2="$"
            value={moneySpent}
            max={moneyLimit || 1}
          />
        </div>
        <div className="poker-card">
          {!gameStarted && (
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
                  <option value="easy">Easy - 1x Multiplier</option>
                  <option value="medium">Medium - 2x Multiplier</option>
                  <option value="hard">Hard - 3x Multiplier</option>
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
                <button onClick={ async () => {
                  if (betAmount <= 0) {
                    alert("Please place a valid bet!");
                    return;
                  }
                  await startGame();
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
        {gameStarted && !gameOver && ( // Put this outside other divs so the buttons are below the cards so it looks clean
          <div className="action-buttons-poker">
            <button onClick={playHand} className="play-hand">
              Play Hand
            </button>
            <button onClick={() => sortHand("rank")} className="sort-rank">
              Sort by Rank
            </button>
            <button onClick={() => sortHand("suit")} className="sort-suit">
              Sort by Suit
            </button>
            <button onClick={discardCards} className="discard">
              Discard
            </button>
          </div>
        )}
      </div>
    </AuthRedirect>
  );
};

export default Poker;
