import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Blackjack from "../components/Blackjack";
import { checkAndResetDailyValues, updateTimeSpent , fetchUserBalance, fetchUserLimits} from "../components/helpers/userInfoHelper.js";
import { toast } from "react-toastify";
import WS from "jest-websocket-mock";

jest.mock("../components/helpers/userInfoHelper");

jest.mock("react-toastify", () => ({
    ...jest.requireActual('react-toastify'),
    toast: {
        ...jest.requireActual('react-toastify').toast,
        error: jest.fn(),
        info: jest.fn(),
    },
}));

let server;

beforeEach(async () => {
  server = new WS('ws://localhost:5050');
});
afterEach(async () => {
    WS.clean();
    jest.clearAllMocks();
});

describe("Blackjack Component", () => {

  test("renders the Poker component", async () => {
    const mockUsername = "testUser";

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    expect(screen.getByText("♠️ Blackjack ♥️")).toBeInTheDocument();
    expect(screen.getByText("Start Game")).toBeInTheDocument();
    expect(screen.getByText("Start Free Game")).toBeInTheDocument();
  });

  test("Balance is set correctly", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    await waitFor(() => {
        expect(screen.getByText("Current Balance: $100")).toBeInTheDocument();
    });
  });

  test("lockout is handled correctly", async () => {
    const mockUsername = "testUser";
    
    // fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 10, moneyLimit: 10, timeSpent: 100, moneySpent: 100} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("You have reached your daily limit and are locked out from playing. Redirecting...", {position: "top-center"});
    });
  });

  test("user websocket connect's successfully", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 100, moneyLimit: 100, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    fireEvent.click(screen.getByText("Start Game"));

    await server.connected;
    await expect(server).toReceiveMessage(JSON.stringify({type: "JOIN" , username: mockUsername, bet: 1, usingFakeMoney: false}));
  });

  test("user joins with fake money successfully", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 100, moneyLimit: 100, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    fireEvent.click(screen.getByText("Start Free Game"));

    await server.connected;
    await expect(server).toReceiveMessage(JSON.stringify({type: "JOIN" , username: mockUsername, bet: 1, usingFakeMoney: true}));
  });

  test("Can't join with an invalid bet", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 10 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 1000, moneyLimit: 1000, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    const betInput = screen.getByDisplayValue(1);    
    fireEvent.change(betInput, { target: { value: 101 } });
    expect(betInput.value).toBe("101");

    fireEvent.click(screen.getByText("Start Game"));
    
    await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Invalid bet amount", {position: "top-center"});
    });
  });
});