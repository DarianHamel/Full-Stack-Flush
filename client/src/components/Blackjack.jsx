//import { NavLink } from "react-router-dom";

export default function Blackjack() {

  async function startGame(){
    try{
      let response;
      // send a POST to /api/blackjack
      response = await fetch("http://localhost:5050/api/blackjack/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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