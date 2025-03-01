const Game = require("../models/Game.js");

const blackjackState = {
    games: [],
    gameIdCounter: 0,
};

function handle_web_socket(ws, username){

    console.log(username + " websocket connected");
    
    ws.on('message', (msg) => {
        console.log('Received: '+ msg + " from " + username);
        try{
            if (JSON.parse(msg).type == "JOIN"){
                assign_player(ws, username);
                ws.send(JSON.stringify({type: "JOIN"}));
            }
            else{
                handle_message(JSON.parse(msg), ws);
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
function assign_player(ws, username){
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
    game.add_player(ws, username);    

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
function handle_message(message, ws){
    if (message.type === "ACTION"){
        for (const g of blackjackState.games){
            g.handle_action(message.action, ws);
        }
    }
    else{
        console.log("Unkown message");
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
