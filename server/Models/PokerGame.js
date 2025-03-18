const Deck = require("./Deck.js");

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
        this.playerHand = this.deck.dealCard(5);
    }

    getPlayerHand() {
        return this.playerHand;
    }

    endGame() {
        this.gameOver = true;
    }

    change_card(card){
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
}

module.exports = PokerGame;