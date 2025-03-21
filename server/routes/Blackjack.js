const axios = require("axios");
const Game = require("../Models/Game.js");

const blackjackState = {
    games: [],
    gameIdCounter: 0,
};

async function handle_web_socket(ws, username){

    console.log(username + " websocket connected");
    
    ws.on('message', async (msg) => {
        const usingFakeMoney = JSON.parse(msg).usingFakeMoney;
        console.log('Received: '+ msg + " from " + username, "bet amount: ",  JSON.parse(msg).bet, " using fake money?:", usingFakeMoney);
        try{
            if (JSON.parse(msg).type == "JOIN"){
                const response = await axios.get('http://localhost:5050/getLimits', {params: {username}});
                const {timeLimit, moneyLimit, timeSpent, moneySpent} = response.data;
                if((timeSpent >= timeLimit || moneySpent >= moneyLimit) && !usingFakeMoney){
                    console.log("User has reached their limit, closing connection");
                    ws.send(JSON.stringify({type: "LOCKOUT"}));
                    ws.close();
                    return;
                }else if(balance < JSON.parse(msg).bet){
                    ws.send(JSON.stringify({type: "NOT_ENOUGH_FUNDS"}));
                    return;
                }
                else if(moneySpent + JSON.parse(msg).bet <= moneyLimit){
                    console.log("Bet amount: ", JSON.parse(msg).bet);
                    if(!usingFakeMoney){
                        assign_player(ws, username, JSON.parse(msg).bet, false);
                    }else{
                        console.log("Fake money bet");
                        assign_player(ws, username, 0, usingFakeMoney); //Don't actually bet any money
                    }
                    ws.send(JSON.stringify({type: "JOIN"}));
                }else{
                    ws.send(JSON.stringify({type: "BET_EXCEEDS_LIMIT"}));
                    return;
                }
            }
            else{
                if(!usingFakeMoney){
                    handle_message(JSON.parse(msg), ws, username, JSON.parse(msg).bet);
                }else{
                    console.log("Fake money bet");
                    handle_message(JSON.parse(msg), ws, username, 0);
                }
            }
        }
        catch (error){
            //Just close the socket and remove the player who sent the bad JSON
            console.log("Failed to parse JSON");
            ws.close();
        }
    });
    
    ws.on('close', () => {
        remove_player(ws);
    });
    
    ws.on('error', (error) => {
        console.log('Websocket error: ', error);
        remove_player(ws);
    })

}

/*
Assign new players to a game, make a new one if none available
*/
function assign_player(ws, username, bet, fakeMoney){
    let game;
    //Search the games for a viable one to join
    for (const g of blackjackState.games){
        if (g.players.length + g.playerQueue.length < g.maxPlayers){
            game = g;
        }
    }
    //If there's no viable games, make a new one
    if (!game) {
        game = new Game(blackjackState.gameIdCounter);
        blackjackState.gameIdCounter++;
        blackjackState.games.push(game);
    }
    game.add_player(ws, username, bet, fakeMoney);    

    return game;

}

/*
Remove players who leave from their game and close the game if it's empty
*/
function remove_player(ws){
    for (let i=0; i<blackjackState.games.length; i++){
        if (blackjackState.games[i].remove_player(ws) && blackjackState.games[i].players.length == 0){
            console.log("Game " + blackjackState.games[i].id + " empty, removing");
            blackjackState.games.splice(i,1);
        }
    }
}

/*
Pass the action and websocket to every game, the game will deal with it if needed
*/
async function handle_message(message, ws, username, bet){
    if (message.type === "ACTION"){
        if(message.action === "PLAY_AGAIN"){
            const response = await axios.get('http://localhost:5050/getLimits', {params: {username}});
                const {timeLimit, moneyLimit, timeSpent, moneySpent, balance} = response.data;
                if(timeSpent >= timeLimit || moneySpent >= moneyLimit){
                    console.log("User has reached their limit, closing connection");
                    ws.send(JSON.stringify({type: "LOCKOUT"}));
                    ws.close();
                    return;
                }else if(moneySpent + Number(bet) > moneyLimit){
                    console.log("Money spent + bet: ", moneySpent + Number(bet))
                    console.log("In handle message");
                    ws.send(JSON.stringify({type: "BET_EXCEEDS_LIMIT"}));
                    ws.close(); 
                    return;
                }else if(balance < bet){
                    ws.send(JSON.stringify({type: "NOT_ENOUGH_FUNDS"}));
                    ws.close();
                    return;
                }
            }
        for (const g of blackjackState.games){
            g.handle_action(message.action, ws, bet);
        }
    }
    else{
        console.log("Unknown message");
        ws.close();
    }
}

//export default router;
//export { handle_web_socket };
module.exports = { 
    handle_web_socket,
    //Export these for testing
    blackjackState,
    assign_player,
    remove_player,
    handle_message
};
