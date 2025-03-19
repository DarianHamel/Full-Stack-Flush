const Deck = require("../models/Deck.js");

class PokerGame {
    constructor(id) {
        this.player = null;
        this.deck = new Deck();
        this.id = id;
        this.started = false;
        this.gameOver = false;
        this.playerHand = [];
        this.scoredHand = [];
        this.currentScore = 0;
    }

    startGame() {
        this.started = true;
        this.playerHand = this.deck.dealCard(8);
    }

    getPlayerHand() {
        return this.playerHand;
    }

    scoreHand(hand) {
      const rankCounts = {};
      const suitCounts = {};

      hand.forEach((card) => {
        rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
      });

      const ranks = Object.values(rankCounts);
      const suits = Object.values(suitCounts);

      if (suits.includes(5)) {
        this.currentScore+=100;
        return "Flush";
    } else if (ranks.includes(4)) {
        this.currentScore+=200;
        return "Four of a Kind";
    } else if (ranks.includes(3) && ranks.includes(2)) {
        this.currentScore+=150;
        return "Full House";
    } else if (ranks.includes(3)) {
        this.currentScore+=100;
        return "Three of a Kind";
    } else if (ranks.filter((count) => count === 2).length === 2) {
        this.currentScore+=50;
        return "Two Pair";
    } else if (ranks.includes(2)) {
        this.currentScore+=25;
        return "Pair";
    } else {
      this.currentScore+=10;
        return "High Card";
    }
    }

    endGame() {
        this.gameOver = true;
    }
}

module.exports = PokerGame;