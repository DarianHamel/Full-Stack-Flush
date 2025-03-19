const Card = require("./Card.js");

class Deck{
    constructor(){
        this.cards = [];
        this.initialize_deck();
        this.shuffle();
    }

    /*
    Creates all the cards of the deck
    */
    initialize_deck(){
        const suits = ['spades', 'hearts', 'diamonds', 'clubs']
        
        for (const suit of suits){
            for (let i = 2; i<=14; i++){
                this.cards.push(new Card(suit, i));
            }
        }
    }

    /*
    Shuffles all the cards in this deck
    For each index in the card array, randomly swap that card with another one
    */
    shuffle(){
        for (let i=0; i<this.cards.length; i++){
            let j = Math.floor(Math.random() * (this.cards.length));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    changeCard(card) {
        if (card.rank === 14) {
            card.rank = "Ace";
        } else if (card.rank === 11) {
            card.rank = "Jack";
        } else if (card.rank === 12) {
            card.rank = "Queen";
        } else if (card.rank === 13) {
            card.rank = "King";
        }
        return card;
        }

    dealCard(numCards) {
        return this.cards.splice(0, numCards).map(this.changeCard);
      }
}

module.exports = Deck;
