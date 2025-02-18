import Player from "./Player.js";
import Deck from "./Deck.js";

class Game{
    constructor(id){
        this.players = [];
        this.deck = new Deck();
        this.dealer = new Player(null);
        this.maxPlayers = 4;
        this.id = id;
        this.started = false;
        this.playingPlayer = 0;
    }

    /*
    Add a player to this game, start the game if it's not started yet
    */
    add_player(ws){
        this.players.push(new Player(ws));
        //Now start the game or let the player know the current state
        if (!this.started){
            ws.send(JSON.stringify({"type": "START"}));
            this.deal();
            this.started = true;
        }
    }

    /*
    Deal cards to each player in the game and message them their dealt cards
    TODO: message all players all other players cards
    */
    deal(){
        for (let i = 0; i<2; i++){
            
            for (const player of this.players){
                const card = this.deck.cards.pop();
                player.hand.push(card);
            }
            this.dealer.hand.push(this.deck.cards.pop());
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

        //Let the player know the dealer's first card
        //TODO: Tell every player about every other player's card
        this.message_dealer_card(0);

        //Check if dealer has 21, end match if so
        if (this.dealer.get_total() === 21){
            console.log("Dealer has natural")
            //let the player's know what the dealer's other card is
            this.message_dealer_card(1);
            
            this.end_game();
        }
        //Otherwise move onto the first player's turn
        else{
            this.next_turn();
        }
    }

    /*
    Tell the current player that it's their turn or move onto the dealer
    */
    next_turn(){

        //Skip each player with 21
        while (this.playingPlayer < this.players.length && this.players[this.playingPlayer].get_total() == 21){
            this.playingPlayer++;
        }
        
        if (this.playingPlayer < this.players.length){
            this.players[this.playingPlayer].ws.send(JSON.stringify({"type": "PLAYER_TURN"}));
        }
        //Dealer's turn
        else{
            console.log("dealer's turn");
            this.dealer_turn();
        }
    }

    /*
    Do all the steps for the dealer's turn
    */
    dealer_turn(){
        //First, let the player's know what the dealer's other card is
        this.message_dealer_card(1);

        //Keep getting cards until the dealer's hand is over 17 and let the players know the new card
        while(this.dealer.get_total() < 17){
            this.dealer.hand.push(this.deck.cards.pop());
            
            this.message_dealer_card(this.dealer.hand.length - 1);
        }

        this.end_game();
    }

    /*
    Calculate who won or lost and tell them
    */
    end_game(){
        const dealerHand = this.dealer.get_total();
        
        for (const player of this.players){
            const playerHand = player.get_total();
            if (playerHand <= 21 && (dealerHand > 21 || playerHand > dealerHand)){
                player.ws.send(JSON.stringify({
                    type: "GAME_OVER",
                    result: "WIN"
                }));
            }
            else if (playerHand < dealerHand || playerHand > 21){
                player.ws.send(JSON.stringify({
                    type: "GAME_OVER",
                    result: "LOSE"
                }));
            }
            else if (playerHand == dealerHand){
                player.ws.send(JSON.stringify({
                    type: "GAME_OVER",
                    result: "NEUTRAL"
                }));
            }
            else {
                console.log("Unknown result");
            }
        }
    }

    /*
    Handle player actions
    Deal a new card for HIT
    Go to the next person on STAND
    */
    handle_action(action, ws){
        for (const player of this.players){
            if (player.ws === ws){
                console.log("Player called " + action + " in game " + this.id);
                switch (action){
                    case "HIT":
                        this.hit(player);
                        break;
                    case "STAND":
                        this.stand(player);
                        break;
                    default:
                        console.log("Unknown action");
                }
            }
        }
    }

    /*
    Deals with the logic for when a player calls HIT
    */
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
        //Check if they have 21, skip them if so
        else if (player.get_total() == 21){
            this.playingPlayer++;
            this.next_turn();
        }
    }

    /*
    Deals with the logic for when a player calls STAND
    Just move to the next player
    */
    stand(player){
        this.playingPlayer++;
        this.next_turn();
    }
    
    /*
    Remove the player with the matching websocket
    Returns a bool for whether a player was removed or not
    */
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

    /*
    Let all of the players know about the dealer's card at the provided index
    */
    message_dealer_card(index){
        for (const player of this.players){
            player.ws.send(JSON.stringify({
                type: "DEALER_CARD",
                card: {suit: this.dealer.hand[index].suit, rank: this.dealer.hand[index].rank }
            }));
        }
    }
}

export default Game;