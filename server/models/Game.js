const Player = require ("./Player.js");
const Deck = require("./Deck.js");
const { handleLose, handleWin } = require("../util/HandleWinLoss.js");

class Game{
    constructor(id){
        this.players = [];
        this.playerQueue = [];
        this.deck;
        this.dealer = new Player(null, null);
        this.maxPlayers = 4;
        this.id = id;
        this.started = false;
        this.playingPlayer = 0;
        this.playerIdCounter = 0;
        this.playersPlayingAgain = 0;
        this.gameOver = false;
    }

    /*
    Add a player to this game if it's not started yet or stick them in the queue
    */
    add_player(ws, username){
        
        //Now start the game or let the player know the current state
        if (!this.started){
            this.players.push(new Player(ws, this.playerIdCounter, username));
            this.playerIdCounter++;
            
            this.start_game();
        }
        else{
            this.playerQueue.push(new Player(ws, this.playerIdCounter, username));
            this.playerIdCounter++;
        }
        
    }

    /*
    Start the game with the players in the queue 
    */
    start_game(){
        //Setup the game
        this.playingPlayer = 0;
        this.playersPlayingAgain = 0;
        this.deck = new Deck(); //Just create a new deck of cards for each game
        this.dealer.hand = [];
        for (const player of this.players){
            player.hand = [];
        }
        this.gameOver = false;

        //Add all the players from the queue to the game
        while (this.playerQueue.length > 0){
            this.players.push(this.playerQueue.pop());
        }

        //Let all the players know the game is starting
        for (const player of this.players){
            player.ws.send(JSON.stringify({"type": "START"}));
        }

        this.started = true;
        this.deal();
    }

    /*
    Deal cards to each player in the game and message them their dealt cards
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
        this.message_dealer_card(0);

        //Then tell the player every other player's deal
        for (const player of this.players){
            for (const otherPlayer of this.players){
                if (player !== otherPlayer){
                    const message = {
                        type: "OTHER_PLAYER_DEAL",
                        id: otherPlayer.id,
                        cards: [
                            { suit: otherPlayer.hand[0].suit, rank: otherPlayer.hand[0].rank },
                            { suit: otherPlayer.hand[1].suit, rank: otherPlayer.hand[1].rank },
                        ]
                    }
                    player.ws.send(JSON.stringify(message));
                }
                
            }
        }

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
                handleWin(player.username);
                player.ws.send(JSON.stringify({
                    type: "GAME_OVER",
                    result: "WIN"
                }));
            }
            else if (playerHand < dealerHand || playerHand > 21){
                handleLose(player.username);
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

        this.gameOver = true;
    }

    /*
    Handle player actions
    Deal a new card for HIT
    Go to the next person on STAND
    Mark the player as wanting to play again on PLAY_AGAIN
    */
    handle_action(action, ws){
        for (const player of this.players){
            if (player.ws === ws){
                console.log(player.username + " called " + action + " in game " + this.id);
                switch (action){
                    case "HIT":
                        //Check if this player is supposed to be calling HIT
                        if (this.players[this.playingPlayer] === player){
                            this.hit(player);
                        }
                        //Just kick them if they're out of sync
                        else{
                            this.kick_player(player.ws);
                        }
                        break;
                    case "STAND":
                        //Check if this player is supposed to be calling STAND
                        if (this.players[this.playingPlayer] === player){
                            this.stand(player);
                        }
                        //Just kick them if they're out of sync
                        else{
                            this.kick_player(player.ws);
                        }
                        break;
                    case "PLAY_AGAIN":
                        //Check if the game is over
                        if (this.gameOver){
                            this.play_again();
                        }
                        //Just kick them if they're out of sync
                        else{
                            this.kick_player(player.ws);
                        }
                        break;
                    default:
                        //Kick the player if they send an unknown action
                        console.log("Unknown action");
                        this.kick_player(player.ws);
                }
            }
        }
    }

    /*
    Kicks the player with the specified websocket
    */
   kick_player(ws){
        this.remove_player(ws);
        ws.close();
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

        //Then message every other player the new card
        for (const otherPlayer of this.players){
            if (player !== otherPlayer){
                const message = {
                    type: "OTHER_PLAYER_DEAL_SINGLE",
                    id: player.id,
                    card: { suit: dealtCard.suit, rank: dealtCard.rank }
                }
                otherPlayer.ws.send(JSON.stringify(message));
            }
        }

        //Check if they bust
        if (player.get_total() > 21){
            player.ws.send(JSON.stringify({type: "BUST"}));
            this.playingPlayer++;
            this.next_turn();
        }
        //Check if they have 21, skip them if so
        else if (player.get_total() == 21){
            //Let them know that they have 21
            player.ws.send(JSON.stringify({type: "TWENTY_ONE"}));
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
    Increment the counter for the number of players who want to play again
    When all the players want to play again, restart the game
    */
    play_again(){
        this.playersPlayingAgain++;

        if (this.playersPlayingAgain >= this.players.length){
            this.start_game();
        }
    }
    
    /*
    Remove the player with the matching websocket
    Returns a bool for whether a player was removed or not
    */
    remove_player(ws){
        let output = false;

        for( let i=0; i<this.players.length; i++){
            if (this.players[i].ws === ws){
                console.log(this.players[i].username + " disconnected from game " + this.id);
                this.players.splice(i, 1);
                output = true;

                //If the currently-playing player left, start the next turn to prevent locking up
                if (i==this.playingPlayer){
                    this.next_turn();
                }

                //Start the next game if enough players want to
                if (this.playersPlayingAgain >= this.players.length){
                    this.start_game();
                }
            }
        }
        for( let i=0; i<this.playerQueue.length; i++){
            if (this.playerQueue[i].ws === ws){
                console.log(this.playerQueue[i].username + " disconnected from game " + this.id + "'s queue");
                this.playerQueue.splice(i, 1);
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

module.exports = Game;