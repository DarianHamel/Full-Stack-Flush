const Card = require("./CardModel.js");

class Deck{
    constructor(){
        this.cards = [];
        this.initializeDeck();
        this.shuffle();
    }

    /*
    Creates all the cards of the deck
    */
    initializeDeck(){
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

    /*
    Deals the first card from the deck
    Returns a single card
    */
    dealCard(numCards) {
        return this.cards.splice(0, numCards);
    }

    /*
    Changes the rank from a numeric value to the respective word value
    */
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

    /*
    Deals the number of cards (numCards) and returns an array with the number of cards
    */
    dealCard(numCards) {
        return this.cards.splice(0, numCards).map(this.changeCard);
    }
}

module.exports = Deck;

