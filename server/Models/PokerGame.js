const Deck = require("../Models/Deck.js");

class PokerGame {
    constructor(id, difficulty = "easy") {
        this.player = null;
        this.deck = new Deck();
        this.id = id;
        this.started = false;
        this.gameOver = false;
        this.playerHand = [];
        this.scoredHand = [];
        this.currentScore = 0;
        this.handsRemaining = 4;
        this.discardsRemaining = 3;
        this.difficulty= difficulty;
        this.targetScore = 500;
    }

    startGame() {
        this.started = true;
        this.playerHand = this.deck.dealCard(8);
        this.handsRemaining = 4;
        this.discardsRemaining = 3;

        if (this.difficulty === "easy") {
          this.targetScore = 25;
        } else if (this.difficulty === "medium") {
          this.targetScore = 500;
        } else {
          this.targetScore = 10;
        }
    }

    getPlayerHand() {
        return this.playerHand;
    }

    scoreHand(hand) {
      console.log(this.handsRemaining);
      if (this.handsRemaining <= 0) {
        this.gameOver = true; // Mark the game as over
        return "Game Over";
     }
        const rankCounts = {};
        const suitCounts = {};
        const ranksInHand = [];

        const rankMap = {
            "Jack": 11,
            "Queen": 12,
            "King": 13,
            "Ace": 14
        };

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
            this.currentScore += 500;
            this.handsRemaining--; // Decrement hands remaining
            return "Straight Flush";
        } else if (isFlush) {
            this.currentScore += 100;
            this.handsRemaining--; // Decrement hands remaining
            return "Flush";
        } else if (isStraight || isAceLowStraight) {
            this.currentScore += 200;
            this.handsRemaining--; // Decrement hands remaining
            return "Straight";
        } else if (ranks.includes(4)) {
            this.currentScore += 200;
            this.handsRemaining--;
            return "Four of a Kind";
        } else if (ranks.includes(3) && ranks.includes(2)) {
            this.currentScore += 150;
            this.handsRemaining--;
            return "Full House";
        } else if (ranks.includes(3)) {
            this.currentScore += 100;
            this.handsRemaining--;
            return "Three of a Kind";
        } else if (ranks.filter((count) => count === 2).length === 2) {
            this.currentScore += 50;
            this.handsRemaining--;
            return "Two Pair";
        } else if (ranks.includes(2)) {
            this.currentScore += 25;
            this.handsRemaining--;
            return "Pair";
        } else {
            this.currentScore += 10;
            this.handsRemaining--;
            return "High Card";
        }
    }

    discardCards(cardsToDiscard) {
        if (this.discardsRemaining <= 0) {
            return "No discards remaining.";
        }

        // Remove the selected cards from the player's hand
        this.playerHand = this.playerHand.filter(
            (card) => !cardsToDiscard.some(
                (discardedCard) => discardedCard.rank === card.rank && discardedCard.suit === card.suit
            )
        );

        // Draw new cards to replace the discarded ones
        const newCards = this.deck.dealCard(cardsToDiscard.length);
        this.playerHand.push(...newCards);

        this.discardsRemaining--; // Decrement discards remaining
        return "Cards discarded successfully.";
    }

    endGame() {
        this.gameOver = true;
    }
}

module.exports = PokerGame;