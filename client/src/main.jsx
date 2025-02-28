import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import 'react-toastify/dist/ReactToastify.css';
import Blackjack from "./components/Blackjack";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(

    <BrowserRouter>
    <App />
    </BrowserRouter>

);
