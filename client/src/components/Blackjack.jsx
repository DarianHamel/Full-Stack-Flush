import { useState, useEffect } from "react";

export default function Blackjack() {

  const [socket, setSocket] = useState(null);
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
  });

  async function startGame(){
    try{
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
        reset_state();
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
      case "JOIN":
        setGameState((prevState) => ({
          ...prevState,
          inGame: true
        }));
        break;
      case "START":
        setGameState((prevState) => ({
          ...prevState,
          playing: true
        }));
        break;
      case "DEAL":
        handle_deal(message);
        break;
      case "PLAYER_TURN":
        setGameState((prevState) => ({
          ...prevState,
          playerTurn: true
        }));
        break;
      case "DEAL_SINGLE":
        handle_deal_single(message);
        break;
      case "BUST":
        setGameState((prevState) => ({
          ...prevState,
          playerTurn: false,
          bust: true
        }));
        break;
      case "DEALER_CARD":
        handle_dealer_card(message);
        break;
      case "GAME_OVER":
        setGameState((prevState) => ({
          ...prevState,
          gameOver: true,
          result: message.result
        }));
        break;
      case "OTHER_PLAYER_DEAL":
        handle_other_deal(message);
        break;
      case "OTHER_PLAYER_DEAL_SINGLE":
        handle_other_deal_single(message);
        break;
      default:
        console.log("Unknown message type");
    }
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
      playing: true,
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
  Adds the other player's hand to the gamestate to display
  */
  function handle_other_deal(message){

    for (const card of message.cards){
      change_card(card);
    }
    setGameState((prevState) => ({
      ...prevState,
      otherPlayers: [...prevState.otherPlayers, {id: message.id, hand: message.cards}]
    }));
  }

  /*
  Adds the new card to the player with the given id
  */
  function handle_other_deal_single(message){
    change_card(message.card);

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
  function play_again(){
    send_message("PLAY_AGAIN");
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
    socket.close()
    reset_state();
  }

  /*
  Reset the game state
  */
  function reset_state(){
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
    });
  }

  return (
    <div>
      {!gameState.inGame && (
        <button onClick={startGame}>Start Game</button>
      )}
      {(gameState.inGame && !gameState.playing && (
        <p>Waiting for other players...</p>
      ))}
      {(gameState.playing) && (
        <div>
          <h2>Your hand</h2>
          {gameState.hand.map((card, index) => (
            <p key={index}>{card.rank} of {card.suit}</p>
          ))}
        
          {gameState.playerTurn && (
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

          {gameState.otherPlayers.length > 0 && (
            <div>
              <br />
              <h2>Other player's hands</h2>
              {gameState.otherPlayers.map((otherPlayer, index) => (
                <div key={index}>
                  {otherPlayer.hand.map((card, index) => (
                    <p key={index}>{card.rank} of {card.suit}</p>
                  ))}
                <br />
                </div>
              ))}
            </div>
          )}
          
          {gameState.gameOver && (
            <div>
              <br />
              <p>Game Over!</p>
              <p>Game result: {gameState.result}</p>
              <br />
              <button onClick={play_again}>Play Again</button>
              <br />
              <button onClick={quit}>Quit</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}