import Card from "./Card.js";

class Deck{
    constructor(){
        this.cards = [];
        this.initialize_deck();
        /*for (const card of this.cards){
            console.log(card.getSuit() + " " + card.getRank());
        }*/
        this.shuffle();
        /*console.log("Shuffled");
        for (const card of this.cards){
            console.log(card.getSuit() + " " + card.getRank());
        }*/
    }

    //Creates all the cards of the deck
    initialize_deck(){
        const suits = ['spades', 'hearts', 'diamonds', 'clubs']
        
        for (const suit of suits){
            for (let i = 2; i<=14; i++){
                this.cards.push(new Card(suit, i));
            }
        }
    }

    //Shuffles all the cards in this deck
    //For each card, randomly swap it with another one
    shuffle(){
        for (let i=0; i<this.cards.length; i++){
            let j = Math.floor(Math.random() * (this.cards.length));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
}

export default Deck;