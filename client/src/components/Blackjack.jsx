import React from "react";
import { useState, useEffect } from "react";
import Card from "./Card.jsx";
import "../design/Blackjack.css";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import AuthRedirect from "./AuthRedirect";
import { checkAndResetDailyValues, updateTimeSpent , fetchUserBalance, fetchUserLimits} from "./helpers/userInfoHelper.js";


export default function Blackjack({username}) {

  const [socket, setSocket] = useState(null);
  const [betAmount, setBetAmount] = useState(1);
  const [fakeMoney, setFakeMoney] = useState(false)
  const [limitHit, setLimitHit] = useState(false);
  const [timeLimit, setTimeLimit] = useState(0);
  const [moneyLimit, setMoneyLimit] = useState(0);
  const [timePlayed, setTimePlayed] = useState(0);
  const [moneySpent, setMoneySpent] = useState(0);
  const [lastTrendMessage, setTrendMessage] = useState(0);
  const trendMessageTimer = 120000; // 2 minutes
  const navigate = useNavigate();
  var startTime = Date.now();
  var newBalance = 0;
  const [gameState, setGameState] = useState({
    otherPlayers: [],
    dealerHand: [],
    hand: [],
    status: "waiting",
    inGame: false,
    playing: false,
    playerTurn: false,
    bust: false,
    gameOver: false,
    result: null,
    balance: 0, //Defaults to 0 until we get the user's balance
  });

  /*
  Calls the functions within on page launch
  Checks the users limits and values and resets on new day
  Gets the user balance and limits and updates const for display
  */
  useEffect(() => {
    checkAndResetDailyValues(username);
    getUserBalance(username);
    getUserLimits(username);
  }, [username]);

  /*
  Gets the user balance (on page launch)
  Sets it in the gameState and the newBalance variable
  */
  const getUserBalance = async (username) => {
    try {
      const balance = await fetchUserBalance(username);
      console.log('Balance is:', balance); 
      newBalance = balance;
      setGameState((prevState) => ({
        ...prevState,
        balance: balance
      }));
    } catch (error) {
      // console.error('Error fetching user balance:', error);
    }
  }

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
      if(limits.moneySpent > limits.moneyLimit || limits.timeSpent >= limits.timeLimit){
        handleLockOut();
      }
    } catch (error) {
      // console.error('Error fetching user limits:', error);
    }
  }

  /*
  Function to lock the user out of playing games as they hit their time to money limit
  Alerts the user and redirects to home page
  */
  const handleLockOut = () => {
    setLimitHit(true);
    toast.error("You have reached your daily limit and are locked out from playing. Redirecting...", {position: "top-center"});
    setTimeout(() => {
    navigate('/'); //Redirect to home page
    }, 3000); // Redirect after 3 seconds
  }

  /*
  Function to control if the user clicked Free game or regular game
  */
  const handleClick = (usingFakeMoney) => {
    console.log(`Using fake money?: ${usingFakeMoney}`);
    startGame(usingFakeMoney);
  };

  /*
  Create the websocket to start the game
  */
  async function startGame(usingFakeMoney){
    console.log(usingFakeMoney);
    if(usingFakeMoney){
      setFakeMoney(true);
      newBalance = 10000;
      gameState.balance = 10000;
    }else{
      if (betAmount <= 0 || betAmount > gameState.balance) {
        toast.info("Invalid bet amount", {position: "top-center"});
        return;
      }
      if (limitHit){
        console.log("Limit hit");
        handleLockOut();
        return;
      }
    }
    if(gameState.balance == 0){
      toast.info("Insufficient funds", {position: "top-center" });
      setLimitHit(true);
      return;
    }
    try{
      const newSocket = new WebSocket('ws://localhost:5050/')

      newSocket.onopen = () => {
        console.log('Connected to websocket server');
        startTime = Date.now();
        if(betAmount+moneySpent <= moneyLimit || usingFakeMoney){
          newSocket.send(JSON.stringify({type: "JOIN" , username: username, bet: betAmount, usingFakeMoney: usingFakeMoney}));
        }else{
          toast.info("Bet exceeds money limit", {position: "top-center"});
        }
      };

      newSocket.onmessage = (event) => {
        console.log('Received: ', event.data);
        handleMessage(JSON.parse(event.data));
      };

      newSocket.onclose = () => {
        console.log('Disconnected from websocket server');
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - startTime)/1000); //Time in seconds
        setTimePlayed(timePlayed + timeSpent);

        updateTimeSpent(username, timeSpent);
        resetState();
      }

      newSocket.onerror = (error) => {
        // console.error('Websocket error: ', error);
      }

      setSocket(newSocket);

    } catch (error) {
      // console.error('A problem occurred starting blackjack game: ', error);
    }
  }

  /*
  Handle all of the messages the server could send to the player
  */
  function handleMessage(message){
    switch (message.type){
      case "JOIN":
        setGameState((prevState) => ({
          ...prevState,
          inGame: true,
          balance: gameState.balance,
        }));
        break;
      case "START":
        if(gameState.balance < betAmount){
          toast.info("Insufficient funds", {position: "top-center"});
          break;
        }
        setBetAmount(document.getElementById("betAmount").value);
        setGameState((prevState) => ({
          ...prevState,
          playing: true,
          balance: newBalance,
        }));
        break;
      case "DEAL":
        handleDeal(message);
        break;
      case "PLAYER_TURN":
        setGameState((prevState) => ({
          ...prevState,
          playerTurn: true
        }));
        break;
      case "DEAL_SINGLE":
        handleDealSingle(message);
        break;
      case "BUST":
        setGameState((prevState) => ({
          ...prevState,
          playerTurn: false,
          bust: true
        }));
        break;
      case "DEALER_CARD":
        handleDealerCard(message);
        break;
      case "GAME_OVER":
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - startTime)/1000); //Time in seconds
        updateTimeSpent(username, timeSpent); //Update the time spent playing
        setTimePlayed(timePlayed + timeSpent); //Update the const for display
        startTime = Date.now();
        setGameState((prevState) => {
          if(prevState.balance){
            newBalance = prevState.balance;
          }else{
            newBalance = gameState.balance;
          }
          if (message.result === "WIN") {
            newBalance += Number(document.getElementById("betAmount").value); // Add the bet amount to the balance
          }else if (message.result === "LOSE"){
            newBalance -= Number(document.getElementById("betAmount").value); // Subtract the bet amount if the player
            if(message.fakeMoney !== true){
              setMoneySpent(prevMoneySpent => {
                const newMoney = prevMoneySpent + Number(betAmount); //Convert to number or JS does weird things...
                return newMoney;
              });
            }
          }
          return {
              ...prevState,
              gameOver: true,
              result: message.result,
              balance: newBalance,
            };
        });
        break;
      case "OTHER_PLAYER_DEAL":
        handleOtherDeal(message);
        break;
      case "OTHER_PLAYER_DEAL_SINGLE":
        handleOtherDealSingle(message);
        break;
      case "TWENTY_ONE":
        setGameState((prevState) => ({
          ...prevState,
          playerTurn: false
        }));
        break;
      case "LOCKOUT":
        handleLockOut();
        break;
      case "TREND_CHANGE":
        if(message !== null){ //Validates if there is a message
          setTrendMessage((prevTrendMessage) => { 
            if(prevTrendMessage - trendMessageTimer < Date.now()){ //Only update and show the message if it has been at least 2 minutes
              console.log("Trend message timer: ", prevTrendMessage - trendMessageTimer);
              toast.info(message.message, {position: "top-center"});
              return Date.now();
            }
            return prevTrendMessage;
          });
        }
        break;
      case "BET_EXCEEDS_LIMIT":
        toast.info("Bet exceeds money limit", {position: "top-center"});
        break;
      case "NOT_ENOUGH_FUNDS":
        toast.info("Bet exceeds balance", {position: "top-center"});
        break;
      default:
        console.log("Unknown message type");
    }
  }

  /*
  Changes the player's hand to what they were dealt
  */
  function handleDeal(message){

    for (const card of message.cards){
      changeCard(card);
    }
    setGameState((prevState) => ({
      ...prevState,
      playing: true,
      hand: message.cards
    }));
  }

  /*
  Adds the single card the player was dealt to their hand
  */
  function handleDealSingle(message){

    changeCard(message.card);
    setGameState((prevState) => ({
      ...prevState,
      hand: [...prevState.hand, message.card]
    }));
  }

  /*
  Adds the single card to the dealer's hand
  */
  function handleDealerCard(message){
    changeCard(message.card);
    setGameState((prevState) => ({
      ...prevState,
      dealerHand: [...prevState.dealerHand, message.card]
    }));
  }

  /*
  Adds the other player's hand to the gamestate to display
  */
  function handleOtherDeal(message){

    for (const card of message.cards){
      changeCard(card);
    }
    setGameState((prevState) => ({
      ...prevState,
      otherPlayers: [...prevState.otherPlayers, {id: message.id, hand: message.cards}]
    }));
  }

  /*
  Adds the new card to the player with the given id
  */
  function handleOtherDealSingle(message){
    changeCard(message.card);

    setGameState((prevState) => ({
      ...prevState,
      otherPlayers: prevState.otherPlayers.map(player =>
        player.id === message.id
          ? {...player, hand: [...player.hand, message.card]}
          : player
        )
    }));
  }

  /*
  Change the numerical value of the card to the face card name
  */
  function changeCard(card){
    if (card.rank === 14){
      card.rank = "Ace"
    }
    else if (card.rank === 11){
      card.rank = "Jack"
    }
    else if (card.rank === 12){
      card.rank = "Queen"
    }
    else if (card.rank === 13){
      card.rank = "King"
    }
  }

  /*
  Sends the specified action to the server
  */
  function sendMessage(type){
    socket.send(JSON.stringify({"type": "ACTION", "action": type, "bet": betAmount, "usingFakeMoney": fakeMoney}));

    //If we're standing, set playerTurn back to false
    if (type === "STAND"){
      //change_state("inProgress");
      setGameState((prevState) => ({
        ...prevState,
        playerTurn: false
      }));
    }
  }

  /*
  Tell the server we wish to play again and reset the state of the game
  */
  function playAgain(){
    startTime = Date.now();
    setBetAmount(document.getElementById("betAmount").value);
    sendMessage("PLAY_AGAIN");
    setGameState({
      otherPlayers: [],
      dealerHand: [],
      hand: [],
      status: "waiting",
      inGame: true,
      playing: false,
      playerTurn: false,
      bust: false,
      gameOver: false,
      result: null,
    });
  }

  /*
  Close the websocket and reset the game state
  */
  function quit(){
    socket.close();
    resetState();
    navigate('/');
  }

  /*
  Reset the game state
  */
  function resetState(){
    setGameState({
      otherPlayers: [],
      dealerHand: [],
      hand: [],
      status: "waiting",
      inGame: false,
      playing: false,
      playerTurn: false,
      bust: false,
      gameOver: false,
      result: null,
      balance: gameState.balance,
    });
  }

  useEffect(() => {
    //close the socket when the page is closed
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN){
        socket.close();
      }
    }
  }, [socket]); //Make sure we do this to the latest websocket

  return (
    <AuthRedirect username={username}>
    
    <div className="blackjack-container">
      <div className="Progress-Bars">
        <ProgressBar label="Time Played" label2="Minutes:" value={Math.floor(timePlayed/60)} max={Math.floor(timeLimit/60) || 1} />
        <ProgressBar disabled={fakeMoney} label="Money Spent" label2="$" value={moneySpent} max={moneyLimit || 1} />
      </div>
      <div className="blackjack-card">
        {!gameState.inGame &&(
          <h1>♠️ Blackjack ♥️</h1>
        )}
        <div className="bet-container">
          <div className="balance-display">
              Current Balance: ${gameState.balance}
          </div>
          <label htmlFor="betAmount">Bet Amount:</label>
          <input disabled={gameState.playing && !gameState.gameOver}
            type="number"
            id="betAmount"
            value={betAmount}
            onChange={(bet) => setBetAmount(Number(bet.target.value))}
            min="1"
            max={Math.min(gameState.balance, moneyLimit-moneySpent) || 1}
          />
        </div>
        {!gameState.inGame &&(
          <div className="button-container">
          <button className="start-button" onClick={() => handleClick(false)}>Start Game</button>
          <button className="start-button-free" onClick={() => handleClick(true)} >Start Free Game</button>
          </div>
        )}
        {(gameState.inGame && !gameState.playing && (
          <p>Waiting for other players...</p>
        ))}
        {(gameState.playing) && (
          
          <div>
            <h2>Dealer hand</h2>
            <div className="card-row">
              {gameState.dealerHand.map((card, index) => (
                <Card key={index} rank={card.rank} suit={card.suit} delay={index * 0.3} />
              ))}
            </div>

            <br/>
            {gameState.bust && (
              <div>
                <br />
                <p>You bust!</p>
              </div>
            )}
            <h2>Your hand</h2>
            <div className="card-row">
                {gameState.hand.map((card, index) => (
                  <Card key={index} rank={card.rank} suit={card.suit} delay={index * 0.3} />
                ))}
              </div>
          
            {gameState.playerTurn && (
              <div className= "action-buttons">
                <br />
                <button onClick={() => sendMessage("HIT")}>Hit</button>
                <br />
                <button onClick={() => sendMessage("STAND")}>Stand</button>
              </div>
            )}

            <br />

            {gameState.otherPlayers.length > 0 && (
              <div className="other-players-container">
                <br />
                <h2>Other player's hands</h2>
                {gameState.otherPlayers.map((otherPlayer, index) => (
                  <div key={index} className="card-row">
                  {otherPlayer.hand.map((card, j) => (
                    <Card key={j} rank={card.rank} suit={card.suit} delay={j * 0.3} />
                  ))}
                </div>
                ))}
              </div>
            )}
            
            {gameState.gameOver && (
              <div>
                <div className="game-outcome">
                <br />
                <p>Game Over!</p>
                <p>Game result: {gameState.result}</p>
                <br />
                </div>
                <div className="action-buttons">
                  <br/>
                  <button onClick={playAgain} disabled={limitHit}>Play Again</button>
                  <br/>
                  <button onClick={quit}>Quit</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </AuthRedirect>
  );
}