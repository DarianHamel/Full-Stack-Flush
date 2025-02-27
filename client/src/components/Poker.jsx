import React from "react";
import "../design/Poker.css";
import { Link } from "react-router-dom";

const Poker = () => {
  return (
    <div className="poker-container">
      <div className="poker-card">
        <h1>Coming Soon!</h1>
        <h1>♠️ Poker Game ♥️</h1>
        <p>
          We’re working hard to bring you an immersive poker experience with the same commitment 
          to responsible gambling. Stay tuned for exciting features, strategic gameplay, 
          and ethical gambling options — all coming your way soon!
        </p>
        <Link to="/" className="back-to-home">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Poker;
