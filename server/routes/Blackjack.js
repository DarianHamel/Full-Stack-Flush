import express from "express";
import Game from "../models/Game.js";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /api/blackjack.
//const router = express.Router();

let games = [];
let gameIdCounter = 0;

// This section will help start a game
/*router.post("/start", async (req, res) => {
    if (games.length == 0) {
        const newGame = new Game();
        games.push(newGame);
    }

    res.send("Game started").status(200);
});*/

function handle_web_socket(ws){

    const game = assign_player(ws);
    console.log("Client connected to game ", game.id);

    ws.on('message', (msg) => {
        console.log('Received: ', msg);
        //pass it to blackjack.js
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    
    ws.on('error', (error) => {
        console.error('Websocket error: ', error);
    })

    ws.send('Hello client!');
}

//Assign new players to a game, make a new one if none available
function assign_player(ws){
    let game;
    //Search the games for a viable one to join
    for (const g of games){
        if (g.players.length < g.maxPlayers){
            game = g;
        }
    }
    //If there's no viable games, make a new one
    if (!game) {
        game = new Game(gameIdCounter);
        gameIdCounter++;
        games.push(game);
    }
    game.addPlayer(ws);    

    return game;

}

//export default router;
export { handle_web_socket };