import { useState, useEffect } from "react";

export default function Blackjack() {

  const [socket, setSocket] = useState(null);

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
        newSocket.send('Hello server!');
      };

      newSocket.onmessage = (event) => {
        console.log('Received: ', event.data);
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
  return (
    <div>
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}