import Player from "./Player.js";
import Deck from "./Deck.js";

class Game{
    constructor(){
        this.player = new Player();
        this.deck = new Deck();
        this.dealerHand = [];
    }
}

export default Game;