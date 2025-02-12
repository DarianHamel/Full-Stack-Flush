import express from "express";
import cors from "cors";
import records from "./routes/record.js";
//import blackjack from "./routes/Blackjack.js";
import { handle_web_socket } from "./routes/Blackjack.js"; //Should probably move it out of ./routes now
import expressWs from "express-ws";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/record", records);
//app.use("/api/blackjack", blackjack);


expressWs(app);

app.ws('/', (ws, req) => {
  //console.log("Client connected");
  //Pass the websocket to blackjack.js to deal with
  handle_web_socket(ws);

  /*ws.on('message', (msg) => {
    console.log('Received: ', msg);
    //pass it to blackjack.js
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('Websocket error: ', error);
  })

  ws.send('Hello client!');*/
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
