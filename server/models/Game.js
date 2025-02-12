import Player from "./Player.js";
import Deck from "./Deck.js";

class Game{
    constructor(id){
        this.players = [];
        this.deck = new Deck();
        this.dealerHand = [];
        this.maxPlayers = 4;
        this.id = id;
    }

    addPlayer(ws){
        this.players.push(new Player(ws));
    }
}

export default Game;