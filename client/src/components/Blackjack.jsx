import { useState, useEffect } from "react";

export default function Blackjack() {

  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    otherPlayer: [],
    dealerHand: [],
    hand: [],
    status: "waiting",
    bust: false,
    result: null,
  });

  async function startGame(){
    try{
      /*let response;
      // send a POST to /api/blackjack
      response = await fetch("http://localhost:5050/api/blackjack/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }*/

      const newSocket = new WebSocket('ws://localhost:5050/')

      newSocket.onopen = () => {
        console.log('Connected to websocket server');
      };

      newSocket.onmessage = (event) => {
        console.log('Received: ', event.data);
        handle_message(JSON.parse(event.data));
      };

      newSocket.onclose = () => {
        console.log('Disconnected from websocket server');
      }

      newSocket.onerror = (error) => {
        console.error('Websocket error: ', error);
      }

      setSocket(newSocket);

    } catch (error) {
      console.error('A problem occurred starting blackjack game: ', error);
    }
  }

  function handle_message(message){
    switch (message.type){
      case "START":
        change_state("inProgress");
        break;
      case "DEAL":
        handle_deal(message);
        break;
      case "PLAYER_TURN":
        change_state("playerTurn");
        break;
      case "DEAL_SINGLE":
        handle_deal_single(message);
        break;
      case "BUST":
        handle_bust();
        break;
      case "DEALER_CARD":
        handle_dealer_card(message);
        break;
      case "GAME_OVER":
        game_over(message);
        break;
      default:
        console.log("Unknown message type");
    }
  }

  /*
  Changes the gamestate to the new specified state
  */
  function change_state(newState){
    setGameState((prevState) => ({
      ...prevState,
      status: newState
    }));
  }

  /*
  Changes the player's hand to what they were dealt
  */
  function handle_deal(message){

    for (const card of message.cards){
      change_card(card);
    }
    setGameState((prevState) => ({
      ...prevState,
      hand: message.cards
    }));
  }

  /*
  Adds the single card the player was dealt to their hand
  */
  function handle_deal_single(message){

    change_card(message.card);
    setGameState((prevState) => ({
      ...prevState,
      hand: [...prevState.hand, message.card]
    }));
  }

  /*
  Set's the game state to bust
  */
  function handle_bust(){
    setGameState((prevState) => ({
      ...prevState,
      bust: true
    }));
  }

  /*
  Adds the single card to the dealer's hand
  */
  function handle_dealer_card(message){

    change_card(message.card);
    setGameState((prevState) => ({
      ...prevState,
      dealerHand: [...prevState.dealerHand, message.card]
    }));
  }

  /*
  Changes the state to game over and changes the result
  */
  function game_over(message){
    
    change_state("gameOver");
    setGameState((prevState) => ({
      ...prevState,
      result: message.result
    }));
  }

  /*
  Change the numerical value of the card to the face card name
  */
  function change_card(card){
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
  function send_message(type){
    socket.send(JSON.stringify({"type": "ACTION", "action": type}));

    //If we're standing, just set the state back to inProgress
    if (type === "STAND"){
      change_state("inProgress");
    }
  }

  return (
    <div>
      {gameState.status === "waiting" && (
        <button onClick={startGame}>Start Game</button>
      )}
      {(gameState.status === "inProgress" || gameState.status === "playerTurn" || gameState.status === "bust" || gameState.status === "gameOver") && (
        <div>
          <h2>Your hand</h2>
          {gameState.hand.map((card, index) => (
            <p key={index}>{card.rank} of {card.suit}</p>
          ))}
        
          {gameState.status === "playerTurn" && (
            <div>
              <br />
              <button onClick={() => send_message("HIT")}>Hit</button>
              <br />
              <button onClick={() => send_message("STAND")}>Stand</button>
            </div>
          )}

          {gameState.bust && (
            <div>
              <br />
              <p>You bust!</p>
            </div>
          )}

          <br />
          <h2>Dealer hand</h2>
          {gameState.dealerHand.map((card, index) => (
            <p key={index}>{card.rank} of {card.suit}</p>
          ))}

          {gameState.status === "gameOver" && (
            <div>
              <br />
              <p>Game Over!</p>
              <p>Game result: {gameState.result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}