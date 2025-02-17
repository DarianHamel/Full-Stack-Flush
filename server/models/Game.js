import Player from "./Player.js";
import Deck from "./Deck.js";

class Game{
    constructor(id){
        this.players = [];
        this.deck = new Deck();
        this.dealerHand = [];
        this.maxPlayers = 4;
        this.id = id;
        this.started = false;
        this.playingPlayer = 0;
    }

    add_player(ws){
        this.players.push(new Player(ws));
        //Now start the game or let the player know the current state
        if (!this.started){
            ws.send(JSON.stringify({"type": "START"}));
            this.deal();
            this.started = true;
        }
    }

    //Deal cards to each player in the game and message them their dealt cards
    //TODO: message all players all other players cards
    deal(){
        for (let i = 0; i<2; i++){
            
            for (const player of this.players){
                const card = this.deck.cards.pop();
                player.hand.push(card);
            }
            this.dealerHand.push(this.deck.cards.pop());
        }
        for (const player of this.players){
            const message = {
                type: "DEAL",
                cards: [
                    { suit: player.hand[0].suit, rank: player.hand[0].rank },
                    { suit: player.hand[1].suit, rank: player.hand[1].rank },
                ]
            }
            player.ws.send(JSON.stringify(message));
        }

        this.next_turn();
    }

    //Tell the current player that it's their turn
    next_turn(){
        if (this.playingPlayer < this.players.length){
            this.players[this.playingPlayer].ws.send(JSON.stringify({"type": "PLAYER_TURN"}));
        }
        //Dealer's turn
        else{
            console.log("dealer's turn");
        }
    }

    //Handle player actions
    //Deal a new card for HIT
    //Go to the next person on STAND
    handle_action(action, ws){
        for (const player of this.players){
            if (player.ws === ws){
                console.log("Player called " + action + " in game " + this.id);
                switch (action){
                    case "HIT":
                        this.hit(player);
                        break;
                    case "STAND":

                        break;
                    default:
                        console.log("Unknown action");
                }
            }
        }
    }

    //Deals with the logic for when a player calls HIT
    hit(player){
        const dealtCard = this.deck.cards.pop();
        player.hand.push(dealtCard);

        const message = {
            type: "DEAL_SINGLE",
            card: {suit: dealtCard.suit, rank: dealtCard.rank}
        }
        player.ws.send(JSON.stringify(message));

        //Check if they bust
        if (player.get_total() > 21){
            player.ws.send(JSON.stringify({type: "BUST"}));
            this.playingPlayer++;
            this.next_turn();
        }
    }
    
    //Remove the player with the matching websocket
    //Returns a bool for whether a player was removed or not
    remove_player(ws){
        let output = false;

        for( let i=0; i<this.players.length; i++){
            if (this.players[i].ws === ws){
                console.log("Player disconnected from game " + this.id);
                this.players.splice(i, 1);
                output = true;
            }
        }
        
        return output;
    }
}

export default Game;