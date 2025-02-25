const Game = require("../models/Game.js");


let games = [];
let gameIdCounter = 0;

function handle_web_socket(ws){
    console.log("Hello");

    const game = assign_player(ws);
    console.log("Client connected to game ", game.id);
    ws.send(JSON.stringify({type: "JOIN"}));

    ws.on('message', (msg) => {
        console.log('Received: '+ msg + " from player in game " + game.id);
        handle_message(JSON.parse(msg), ws);
    });
    
    ws.on('close', () => {
        remove_player(ws);
    });
    
    ws.on('error', (error) => {
        console.error('Websocket error: ', error);
    })

}

/*
Assign new players to a game, make a new one if none available
*/
function assign_player(ws, user){
    let game;
    //Search the games for a viable one to join
    for (const g of games){
        if (g.players.length + g.playerQueue.length < g.maxPlayers){
            game = g;
        }
    }
    //If there's no viable games, make a new one
    if (!game) {
        console.log("game");
        game = new Game(gameIdCounter);
        gameIdCounter++;
        games.push(game);
    }
    game.add_player(ws);    

    return game;

}

/*
Remove players who leave from their game and close the game if it's empty
*/
function remove_player(ws){
    for (let i=0; i<games.length; i++){
        if (games[i].remove_player(ws) && games[i].players.length == 0){
            console.log("Game " + games[i].id + " empty, removing");
            games.splice(i,1);
        }
    }
}

/*
Pass the action and websocket to every game, the game will deal with it if needed
*/
function handle_message(message, ws){
    if (message.type === "ACTION"){
        for (const g of games){
            g.handle_action(message.action, ws);
        }
    }
}

//export default router;
//export { handle_web_socket };
module.exports = { handle_web_socket };
