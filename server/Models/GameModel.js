const Player = require ("./PlayerModel.js");
const Deck = require("./DeckModel.js");
const { handleLose, handleWin } = require("../util/HandleWinLoss.js");
const { handleBet } = require("../util/HandleBet.js");

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
    addPlayer(ws, username, betAmount, fakeMoney){

        //Now start the game or let the player know the current state
        if (!this.started){
            this.players.push(new Player(ws, this.playerIdCounter, username, betAmount, fakeMoney));
            this.playerIdCounter++;
            if(!fakeMoney){
                handleBet(username, betAmount);
            }
            this.start_game();
        }
        else{
            this.playerQueue.push(new Player(ws, this.playerIdCounter, username, betAmount, fakeMoney));
            this.playerIdCounter++;
        }
        
    }

    /*
    Start the game with the players in the queue 
    */
    startGame(){
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
        this.messageDealerCard(0);

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
        if (this.dealer.getTotal() === 21){
            console.log("Dealer has natural")
            //let the player's know what the dealer's other card is
            this.messageDealerCard(1);
            
            this.endGame();
        }
        //Otherwise move onto the first player's turn
        else{
            this.nextTurn();
        }
    }

    /*
    Tell the current player that it's their turn or move onto the dealer
    */
    nextTurn(){

        //Skip each player with 21
        while (this.playingPlayer < this.players.length && this.players[this.playingPlayer].getTotal() == 21){
            this.playingPlayer++;
        }
        
        if (this.playingPlayer < this.players.length){
            this.players[this.playingPlayer].ws.send(JSON.stringify({"type": "PLAYER_TURN"}));
        }
        //Dealer's turn
        else{
            console.log("dealer's turn");
            this.dealerTurn();
        }
    }

    /*
    Do all the steps for the dealer's turn
    */
    dealerTurn(){
        //First, let the player's know what the dealer's other card is
        this.messageDealerCard(1);

        //Keep getting cards until the dealer's hand is over 17 and let the players know the new card
        while(this.dealer.getTotal() < 17){
            this.dealer.hand.push(this.deck.cards.pop());
            
            this.messageDealerCard(this.dealer.hand.length - 1);
        }

        this.endGame();
    }

    /*
    Calculate who won or lost and tell them
    */
    endGame(){
        const dealerHand = this.dealer.getTotal();
        const game = "Blackjack";
        
        for (const player of this.players){
            const playerHand = player.getTotal();
            if (playerHand <= 21 && (dealerHand > 21 || playerHand > dealerHand)){
                console.log(player.bet);
                handleWin(player.username, 2*player.bet, game); //Update the state of the users bet and number of wins
                player.ws.send(JSON.stringify({
                    type: "GAME_OVER",
                    result: "WIN"
                }));
            }
            else if (playerHand < dealerHand || playerHand > 21){
                console.log(player.bet);
                handleLose(player.username, player.bet, game); //Update the state of the users bet and number of losses
                player.ws.send(JSON.stringify({
                    type: "GAME_OVER",
                    result: "LOSE",
                    fakeMoney: player.fakeMoney,
                }))
                
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
    Mark the player as wanting to play again on playAgain
    */
    async handleAction(action, ws, bet){
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
                            this.kickPlayer(player.ws);
                        }
                        break;
                    case "STAND":
                        //Check if this player is supposed to be calling STAND
                        if (this.players[this.playingPlayer] === player){
                            this.stand(player);
                        }
                        //Just kick them if they're out of sync
                        else{
                            this.kickPlayer(player.ws);
                        }
                        break;
                    case "PLAY_AGAIN":
                        //Check if the game is over
                        if (this.gameOver){
                            var message;
                            if(player.fakeMoney){ //Handle if the user is playing with fake currency
                                player.bet = 0;
                            }else{
                                player.bet = bet;
                                message = await handleBet(player.username, player.bet); //Only call /bet if we're using real money
                            }
                            player.ws.send(JSON.stringify({type: "TREND_CHANGE", message: message || null}));
                            this.playAgain();
                        }
                        //Just kick them if they're out of sync
                        else{
                            this.kickPlayer(player.ws);
                        }
                        break;
                    default:
                        //Kick the player if they send an unknown action
                        console.log("Unknown action");
                        this.kickPlayer(player.ws);
                }
            }
        }
    }

    /*
    Kicks the player with the specified websocket
    */
   kickPlayer(ws){
        this.removePlayer(ws);
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
        if (player.getTotal() > 21){
            player.ws.send(JSON.stringify({type: "BUST"}));
            this.playingPlayer++;
            this.nextTurn();
        }
        //Check if they have 21, skip them if so
        else if (player.getTotal() == 21){
            //Let them know that they have 21
            player.ws.send(JSON.stringify({type: "TWENTY_ONE"}));
            this.playingPlayer++;
            this.nextTurn();
        }
    }

    /*
    Deals with the logic for when a player calls STAND
    Just move to the next player
    */
    stand(player){
        this.playingPlayer++;
        this.nextTurn();
    }

    /*
    Increment the counter for the number of players who want to play again
    When all the players want to play again, restart the game
    */
    playAgain(){
        this.playersPlayingAgain++;

        if (this.playersPlayingAgain >= this.players.length){
            this.startGame();
        }
    }
    
    /*
    Remove the player with the matching websocket
    Returns a bool for whether a player was removed or not
    */
    removePlayer(ws){
        let output = false;

        for( let i=0; i<this.players.length; i++){
            if (this.players[i].ws === ws){
                console.log(this.players[i].username + " disconnected from game " + this.id);
                this.players.splice(i, 1);
                output = true;

                //If the currently-playing player left, start the next turn to prevent locking up
                if (i==this.playingPlayer){
                    this.nextTurn();
                }

                //Start the next game if enough players want to
                if (this.playersPlayingAgain >= this.players.length){
                    this.startGame();
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
    messageDealerCard(index){
        for (const player of this.players){
            player.ws.send(JSON.stringify({
                type: "DEALER_CARD",
                card: {suit: this.dealer.hand[index].suit, rank: this.dealer.hand[index].rank }
            }));
        }
    }
}

module.exports = Game;
