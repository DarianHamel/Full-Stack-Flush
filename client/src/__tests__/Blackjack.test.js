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

  test("Can't join without any money in balance", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 0 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 1000, moneyLimit: 1000, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    const betInput = screen.getByDisplayValue(1);    
    fireEvent.change(betInput, { target: { value: 0 } });
    expect(betInput.value).toBe("0");

    fireEvent.click(screen.getByText("Start Game"));
    await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Insufficient funds", {position: "top-center"});
    });

    fireEvent.click(screen.getByText("Start Game"));
    
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("You have reached your daily limit and are locked out from playing. Redirecting...", {position: "top-center"});
    });
  });

  test("LOCKOUT message handled correctly", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 1000, moneyLimit: 1000, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    fireEvent.click(screen.getByText("Start Game"));
    await server.connected;

    server.send(JSON.stringify({type: "LOCKOUT"}));
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("You have reached your daily limit and are locked out from playing. Redirecting...", {position: "top-center"});
    });
  });

  test("TREND_CHANGE message handled correctly", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 1000, moneyLimit: 1000, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    fireEvent.click(screen.getByText("Start Game"));
    await server.connected;

    server.send(JSON.stringify({type: "TREND_CHANGE", message:{ money: 100 , message: "You're spending more than your average daily amount"}}));
    await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith({message: "You're spending more than your average daily amount", money: 100}, {position: "top-center"});
    });
  });

  test("BET_EXCEEDS_LIMIT message handled correctly", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 1000, moneyLimit: 1000, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    fireEvent.click(screen.getByText("Start Game"));
    await server.connected;

    server.send(JSON.stringify({type: "BET_EXCEEDS_LIMIT"}));
    await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Bet exceeds money limit", {position: "top-center"});
    });
  });

  test("NOT_ENOUGH_FUNDS message handled correctly", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 1000, moneyLimit: 1000, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    fireEvent.click(screen.getByText("Start Game"));
    await server.connected;

    server.send(JSON.stringify({type: "NOT_ENOUGH_FUNDS"}));
    await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Bet exceeds balance", {position: "top-center"});
    });
  });

  test("Integration test of a dealer and player natural", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 1000, moneyLimit: 1000, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    fireEvent.click(screen.getByText("Start Game"));

    await server.connected;
    server.send(JSON.stringify({type: "JOIN"}));
    expect(screen.getByText("Waiting for other players...")).toBeInTheDocument();

    server.send(JSON.stringify({type: "START"}));
    expect(screen.getByText("Dealer hand")).toBeInTheDocument();

    const deal_message = {
        type: "DEAL",
        cards: [
            { suit: "hearts", rank: 10 },
            { suit: "hearts", rank: 14 },
        ]
    }
    server.send(JSON.stringify(deal_message));
    expect(screen.getByText("Your hand")).toBeInTheDocument();
    expect(screen.getByAltText("10 of hearts")).toBeInTheDocument();
    expect(screen.getByAltText("Ace of hearts")).toBeInTheDocument();

    server.send(JSON.stringify({
        type: "DEALER_CARD",
        card: {suit: "spades", rank: 12 }
    }));
    server.send(JSON.stringify({
        type: "DEALER_CARD",
        card: {suit: "spades", rank: 14 }
    }));
    expect(screen.getByAltText("Queen of spades")).toBeInTheDocument();
    expect(screen.getByAltText("Ace of spades")).toBeInTheDocument();

    server.send(JSON.stringify({
        type: "GAME_OVER",
        result: "NEUTRAL",
        fakeMoney: false,
    }))
    expect(screen.getByText("Game Over!")).toBeInTheDocument();
    expect(screen.getByText("Game result: NEUTRAL")).toBeInTheDocument();
  });
  
  test("Integration test of a player bust and playing again", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 1000, moneyLimit: 1000, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    fireEvent.click(screen.getByText("Start Game"));
    await expect(server).toReceiveMessage(JSON.stringify({type: "JOIN" , username: mockUsername, bet: 1, usingFakeMoney: false}));

    await server.connected;
    server.send(JSON.stringify({type: "JOIN"}));
    expect(screen.getByText("Waiting for other players...")).toBeInTheDocument();

    server.send(JSON.stringify({type: "START"}));
    expect(screen.getByText("Dealer hand")).toBeInTheDocument();

    const deal_message = {
        type: "DEAL",
        cards: [
            { suit: "hearts", rank: 9 },
            { suit: "hearts", rank: 14 },
        ]
    }
    server.send(JSON.stringify(deal_message));
    expect(screen.getByText("Your hand")).toBeInTheDocument();
    expect(screen.getByAltText("9 of hearts")).toBeInTheDocument();
    expect(screen.getByAltText("Ace of hearts")).toBeInTheDocument();

    server.send(JSON.stringify({
        type: "DEALER_CARD",
        card: {suit: "spades", rank: 12 }
    }));
    expect(screen.getByAltText("Queen of spades")).toBeInTheDocument();

    server.send(JSON.stringify({"type": "PLAYER_TURN"}));
    expect(screen.getByText("Hit")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Hit"));
    await expect(server).toReceiveMessage(JSON.stringify({type: "ACTION" , action: "HIT", bet: "1", usingFakeMoney: false}));

    server.send(JSON.stringify({
        type: "DEAL_SINGLE",
        card: {suit: "spades", rank: 10}
    }));
    expect(screen.getByAltText("10 of spades")).toBeInTheDocument();

    server.send(JSON.stringify({type: "BUST"}));
    expect(screen.getByText("You bust!")).toBeInTheDocument();

    server.send(JSON.stringify({
        type: "DEALER_CARD",
        card: {suit: "spades", rank: 13 }
    }));
    expect(screen.getByAltText("King of spades")).toBeInTheDocument();

    server.send(JSON.stringify({
        type: "GAME_OVER",
        result: "LOSE",
        fakeMoney: false,
    }))
    expect(screen.getByText("Game result: LOSE")).toBeInTheDocument();

    expect(screen.getByText("Play Again")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Play Again"));

    expect(screen.getByText("Waiting for other players...")).toBeInTheDocument();
  });


  test("Integration test of a player hit 21 and a second player playing", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 1000, moneyLimit: 1000, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    fireEvent.click(screen.getByText("Start Game"));
    await expect(server).toReceiveMessage(JSON.stringify({type: "JOIN" , username: mockUsername, bet: 1, usingFakeMoney: false}));

    await server.connected;
    server.send(JSON.stringify({type: "JOIN"}));
    expect(screen.getByText("Waiting for other players...")).toBeInTheDocument();

    server.send(JSON.stringify({type: "START"}));
    expect(screen.getByText("Dealer hand")).toBeInTheDocument();

    const deal_message = {
        type: "DEAL",
        cards: [
            { suit: "hearts", rank: 9 },
            { suit: "hearts", rank: 14 },
        ]
    }
    server.send(JSON.stringify(deal_message));
    expect(screen.getByText("Your hand")).toBeInTheDocument();
    expect(screen.getByAltText("9 of hearts")).toBeInTheDocument();
    expect(screen.getByAltText("Ace of hearts")).toBeInTheDocument();

    server.send(JSON.stringify({
        type: "DEALER_CARD",
        card: {suit: "spades", rank: 12 }
    }));
    expect(screen.getByAltText("Queen of spades")).toBeInTheDocument();

    const other_deal_message = {
        type: "OTHER_PLAYER_DEAL",
        id: 1,
        cards: [
            { suit: "diamonds", rank: 2 },
            { suit: "clubs", rank: 3 },
        ]
    }
    server.send(JSON.stringify(other_deal_message));
    expect(screen.getByText("Other player's hands")).toBeInTheDocument();
    expect(screen.getByAltText("2 of diamonds")).toBeInTheDocument();
    expect(screen.getByAltText("3 of clubs")).toBeInTheDocument();

    server.send(JSON.stringify({"type": "PLAYER_TURN"}));
    expect(screen.getByText("Hit")).toBeInTheDocument();
    expect(screen.getByText("Stand")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Hit"));
    await expect(server).toReceiveMessage(JSON.stringify({type: "ACTION" , action: "HIT", bet: "1", usingFakeMoney: false}));

    server.send(JSON.stringify({
        type: "DEAL_SINGLE",
        card: {suit: "clubs", rank: 14}
    }));
    expect(screen.getByAltText("Ace of clubs")).toBeInTheDocument();

    server.send(JSON.stringify({type: "TWENTY_ONE"}));
    expect(screen.queryByText("Hit")).not.toBeInTheDocument();
    expect(screen.queryByText("Stand")).not.toBeInTheDocument();

    server.send(JSON.stringify({
        type: "OTHER_PLAYER_DEAL_SINGLE",
        id: 1,
        card: { suit: "clubs", rank: 2 }
    }));
    expect(screen.getByAltText("2 of clubs")).toBeInTheDocument();

    server.send(JSON.stringify({
        type: "DEALER_CARD",
        card: {suit: "spades", rank: 2 }
    }));
    expect(screen.getByAltText("2 of spades")).toBeInTheDocument();

    server.send(JSON.stringify({
        type: "GAME_OVER",
        result: "WIN",
        fakeMoney: false,
    }))
    expect(screen.getByText("Game result: WIN")).toBeInTheDocument();
  });

  test("Integration test of a player standing, winning, and quitting", async () => {
    const mockUsername = "testUser";
    
    fetchUserBalance.mockResolvedValueOnce( 100 );
    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 1000, moneyLimit: 1000, timeSpent: 0, moneySpent: 0} );

    await act(async () => {
        render(
            <Router>
                <Blackjack username={mockUsername} />
            </Router>
        );
    });

    fireEvent.click(screen.getByText("Start Game"));
    await expect(server).toReceiveMessage(JSON.stringify({type: "JOIN" , username: mockUsername, bet: 1, usingFakeMoney: false}));

    await server.connected;
    server.send(JSON.stringify({type: "JOIN"}));
    expect(screen.getByText("Waiting for other players...")).toBeInTheDocument();

    server.send(JSON.stringify({type: "START"}));
    expect(screen.getByText("Dealer hand")).toBeInTheDocument();

    const deal_message = {
        type: "DEAL",
        cards: [
            { suit: "hearts", rank: 9 },
            { suit: "hearts", rank: 14 },
        ]
    }
    server.send(JSON.stringify(deal_message));
    expect(screen.getByText("Your hand")).toBeInTheDocument();
    expect(screen.getByAltText("9 of hearts")).toBeInTheDocument();
    expect(screen.getByAltText("Ace of hearts")).toBeInTheDocument();

    server.send(JSON.stringify({
        type: "DEALER_CARD",
        card: {suit: "spades", rank: 12 }
    }));
    expect(screen.getByAltText("Queen of spades")).toBeInTheDocument();

    server.send(JSON.stringify({"type": "PLAYER_TURN"}));
    expect(screen.getByText("Hit")).toBeInTheDocument();
    expect(screen.getByText("Stand")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Stand"));
    await expect(server).toReceiveMessage(JSON.stringify({type: "ACTION" , action: "STAND", bet: "1", usingFakeMoney: false}));

    expect(screen.queryByText("Hit")).not.toBeInTheDocument();
    expect(screen.queryByText("Stand")).not.toBeInTheDocument();

    server.send(JSON.stringify({
        type: "DEALER_CARD",
        card: {suit: "spades", rank: 7 }
    }));
    expect(screen.getByAltText("7 of spades")).toBeInTheDocument();

    server.send(JSON.stringify({
        type: "GAME_OVER",
        result: "WIN",
        fakeMoney: false,
    }))
    expect(screen.getByText("Game result: WIN")).toBeInTheDocument();

    expect(screen.getByText("Quit")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Quit"));

    expect(screen.getByText("♠️ Blackjack ♥️")).toBeInTheDocument();
  });

});