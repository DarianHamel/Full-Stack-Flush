const Deck = require("../Models/Deck.js");

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
      const ranksInHand = [];

      // map them back to numbers to check straights lol
      // just undoes the previous mapping for rendering cards
      const rankMap = {
        "Jack": 11,
        "Queen": 12,
        "King": 13,
        "Ace": 14
      }

      hand.forEach((card) => {
        const rank = typeof card.rank === "string" ? rankMap[card.rank] : card.rank;
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
        ranksInHand.push(rank);
      });

      const ranks = Object.values(rankCounts);
      const suits = Object.values(suitCounts);

      ranksInHand.sort((a, b) => a - b);

      const isFlush = suits.includes(5);

      const isStraight = ranksInHand.length === 5 && ranksInHand[4] - ranksInHand[0] === 4 && new Set(ranksInHand).size === 5;

      const isAceLowStraight = ranksInHand.includes(14) && ranksInHand.includes(2) && ranksInHand.includes(3) && ranksInHand.includes(4) && ranksInHand.includes(5);

      if (isFlush && (isStraight || isAceLowStraight)) {
        this.currentScore+=500;
        return "Straight Flush";
      }
      else if (isFlush) {
        this.currentScore += 100;
        return "Flush";
      }
      else if (isStraight || isAceLowStraight) {
        this.currentScore+=200;
        return "Straight";
      }
      // other cases that aren't straights or flushes
     else if (ranks.includes(4)) {
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