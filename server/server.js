import express from "express";
import cors from "cors";
import records from "./routes/record.js";
import blackjack from "./routes/Blackjack.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/record", records);
app.use("/api/blackjack", blackjack);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
