import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Poker from "../components/Poker";
import { checkAndResetDailyValues, updateTimeSpent , fetchUserBalance, fetchUserLimits} from "../components/helpers/userInfoHelper.js";

jest.mock("../components/helpers/userInfoHelper");

window.alert = jest.fn();
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  fetch.mockReset();
});

describe("Poker Component",  () => {

  test("renders the Poker component", async() => {
    const mockUsername = "testUser";

    fetchUserLimits.mockResolvedValueOnce( {timeLimit: 120, moneyLimit: 100, timeSpent: 60, moneySpent: 10} );

    await act(async () => {
      render(
          <Router>
              <Poker username={mockUsername} />
          </Router>
      );
    });
    expect(screen.getByText("♠️ Poker Minigame ♥️")).toBeInTheDocument();
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
  });

  test("User limits are set correctly", async () => {
      const mockUsername = "testUser";
      
      fetchUserLimits.mockResolvedValueOnce( {timeLimit: 10, moneyLimit: 10, timeSpent: 100, moneySpent: 100} );
  
      await act(async () => {
          render(
              <Router>
                  <Poker username={mockUsername} />
              </Router>
          );
      });
  
      expect(window.alert).toHaveBeenCalledWith("You have reached your daily limit and are locked out from playing. Redirecting...", {position: "top-center"});
    });

    test("Players can't play with invalid bet", async () => {
      const mockUsername = "testUser";
      
      fetchUserLimits.mockResolvedValueOnce( {timeLimit: 100, moneyLimit: 100, timeSpent: 0, moneySpent: 0} );
  
      await act(async () => {
          render(
              <Router>
                  <Poker username={mockUsername} />
              </Router>
          );
      });

      const betInput = screen.getByDisplayValue(0);    
      // fireEvent.change(betInput, { target: { value: 101 } });
      // expect(betInput.value).toBe("101");
  
      fireEvent.click(screen.getByText("Start Game"));
      
      await waitFor(() => {
          expect(window.alert).toHaveBeenCalledWith("Please place a valid bet!");
      });
    });

    test("Handles start game responses correctly", async () => {
      const mockUsername = "testUser";
      
      fetchUserLimits.mockResolvedValueOnce( {timeLimit: 100, moneyLimit: 100, timeSpent: 0, moneySpent: 0} );
      fetch
        .mockResolvedValueOnce({test: "test"})  /*Bet*/
        .mockResolvedValueOnce({  /*Start game*/
          ok: true,
          json: async () => ({
            gameID: 1,
            playerHand: [
              { suit: 'spades', rank: 2 },
              { suit: 'spades', rank: 3 },
              { suit: 'spades', rank: 4 },
              { suit: 'spades', rank: 5 },
              { suit: 'spades', rank: 6 },
              { suit: 'spades', rank: 7 },
              { suit: 'spades', rank: 8 },
              { suit: 'spades', rank: 9 },
            ],
            handsRemaining: 4,
            discardsRemaining: 3,
            gameOver: false,
            difficulty: 'easy',
            targetScore: 500,
          }),
        })
        .mockResolvedValueOnce({  /*update money spent*/
          ok: true,
          json: async () => ({"success":true,"message":"Money spent updated successfully","updatedDailyMoneySpent":1}),
        })
        .mockResolvedValueOnce({  /*handle transaction*/
          ok: true,
          json: async () => ({"success":true}),
        });

      await act(async () => {
          render(
              <Router>
                  <Poker username={mockUsername} />
              </Router>
          );
      });

      const betInput = screen.getByDisplayValue(0);    
      fireEvent.change(betInput, { target: { value: 1 } });
      expect(betInput.value).toBe("1");

      await act(async () => {
        fireEvent.click(screen.getByText("Start Game"));
      });
      
      expect(screen.getByText("Hands Remaining: 4")).toBeInTheDocument();
      expect(screen.getByText("Discards Remaining: 3")).toBeInTheDocument();
      expect(screen.getByAltText("2 of spades")).toBeInTheDocument();
      expect(screen.getByAltText("3 of spades")).toBeInTheDocument();
      expect(screen.getByAltText("4 of spades")).toBeInTheDocument();
      expect(screen.getByAltText("5 of spades")).toBeInTheDocument();
      expect(screen.getByAltText("6 of spades")).toBeInTheDocument();
      expect(screen.getByAltText("7 of spades")).toBeInTheDocument();
      expect(screen.getByAltText("8 of spades")).toBeInTheDocument();
      expect(screen.getByText("Current Score: 0")).toBeInTheDocument();
      expect(screen.getByText("Target Score: 500")).toBeInTheDocument();
    });

    test("Make sure discard works correctly", async () => {
      const mockUsername = "testUser";
      
      fetchUserLimits.mockResolvedValueOnce( {timeLimit: 100, moneyLimit: 100, timeSpent: 0, moneySpent: 0} );
      fetch
        .mockResolvedValueOnce({test: "test"})  /*Bet*/
        .mockResolvedValueOnce({  /*Start game*/
          ok: true,
          json: async () => ({
            gameID: 1,
            playerHand: [
              { suit: 'spades', rank: 2 },
              { suit: 'spades', rank: 3 },
              { suit: 'spades', rank: 4 },
              { suit: 'spades', rank: 5 },
              { suit: 'spades', rank: 6 },
              { suit: 'spades', rank: 7 },
              { suit: 'spades', rank: 8 },
              { suit: 'spades', rank: 9 },
            ],
            handsRemaining: 4,
            discardsRemaining: 3,
            gameOver: false,
            difficulty: 'easy',
            targetScore: 500,
          }),
        })
        .mockResolvedValueOnce({  /*update money spent*/
          ok: true,
          json: async () => ({"success":true,"message":"Money spent updated successfully","updatedDailyMoneySpent":1}),
        })
        .mockResolvedValueOnce({  /*handle transaction*/
          ok: true,
          json: async () => ({"success":true}),
        })
        .mockResolvedValueOnce({  /*draw*/
          ok: true,
          json: async () => ({"newCards":[{"suit":"spades","rank":10}]}),
        })
        .mockResolvedValueOnce({  /*draw*/
          ok: true,
          json: async () => ({"newCards":[{"suit":"clubs","rank":10}]}),
        })
        .mockResolvedValueOnce({  /*draw*/
          ok: true,
          json: async () => ({"newCards":[{"suit":"diamonds","rank":10}]}),
        })
        .mockResolvedValueOnce({  /*draw*/
          ok: true,
          json: async () => ({"newCards":[{"suit":"hearts","rank":10}]}),
        });

      await act(async () => {
          render(
              <Router>
                  <Poker username={mockUsername} />
              </Router>
          );
      });

      const betInput = screen.getByDisplayValue(0);    
      fireEvent.change(betInput, { target: { value: 1 } });
      expect(betInput.value).toBe("1");

      await act(async () => {
        fireEvent.click(screen.getByText("Start Game"));
      });
      await act(async () => {
        fireEvent.click(screen.getByAltText("2 of spades"));
        fireEvent.click(screen.getByText("Discard"));
      });
      expect(screen.getByText("Discards Remaining: 2")).toBeInTheDocument();
      expect(screen.queryByText("2 of spades")).not.toBeInTheDocument();
      expect(screen.getByAltText("10 of spades")).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(screen.getByAltText("10 of spades"));
        fireEvent.click(screen.getByText("Discard"));
      });
      expect(screen.getByText("Discards Remaining: 1")).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByAltText("10 of clubs"));
        fireEvent.click(screen.getByText("Discard"));
      });
      expect(screen.getByText("Discards Remaining: 0")).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByAltText("10 of diamonds"));
        fireEvent.click(screen.getByText("Discard"));
      });
      expect(window.alert).toHaveBeenCalledWith("No discards remaining.");
    });

    test("Make sure sorting works correctly", async () => {
      const mockUsername = "testUser";
      
      fetchUserLimits.mockResolvedValueOnce( {timeLimit: 100, moneyLimit: 100, timeSpent: 0, moneySpent: 0} );
      fetch
        .mockResolvedValueOnce({test: "test"})  /*Bet*/
        .mockResolvedValueOnce({  /*Start game*/
          ok: true,
          json: async () => ({
            gameID: 1,
            playerHand: [
              { suit: 'spades', rank: 2 },
              { suit: 'spades', rank: 3 },
              { suit: 'spades', rank: 4 },
              { suit: 'spades', rank: 5 },
              { suit: 'spades', rank: 6 },
              { suit: 'spades', rank: 7 },
              { suit: 'spades', rank: 8 },
              { suit: 'spades', rank: 9 },
            ],
            handsRemaining: 4,
            discardsRemaining: 3,
            gameOver: false,
            difficulty: 'easy',
            targetScore: 500,
          }),
        })
        .mockResolvedValueOnce({  /*update money spent*/
          ok: true,
          json: async () => ({"success":true,"message":"Money spent updated successfully","updatedDailyMoneySpent":1}),
        })
        .mockResolvedValueOnce({  /*handle transaction*/
          ok: true,
          json: async () => ({"success":true}),
        })
        .mockResolvedValueOnce({  /*sort*/
          ok: true,
          json: async () => ({
            sortedHand: [
              { suit: 'hearts', rank: 2 },
              { suit: 'hearts', rank: 3 },
              { suit: 'hearts', rank: 4 },
              { suit: 'hearts', rank: 5 },
              { suit: 'hearts', rank: 6 },
              { suit: 'hearts', rank: 7 },
              { suit: 'hearts', rank: 8 },
              { suit: 'hearts', rank: 9 },
            ],
          }),
        })
        .mockResolvedValueOnce({  /*sort*/
          ok: true,
          json: async () => ({
            sortedHand: [
              { suit: 'diamonds', rank: 2 },
              { suit: 'diamonds', rank: 3 },
              { suit: 'diamonds', rank: 4 },
              { suit: 'diamonds', rank: 5 },
              { suit: 'diamonds', rank: 6 },
              { suit: 'diamonds', rank: 7 },
              { suit: 'diamonds', rank: 8 },
              { suit: 'diamonds', rank: 9 },
            ],
          }),
        });

      await act(async () => {
          render(
              <Router>
                  <Poker username={mockUsername} />
              </Router>
          );
      });

      const betInput = screen.getByDisplayValue(0);    
      fireEvent.change(betInput, { target: { value: 1 } });
      expect(betInput.value).toBe("1");

      await act(async () => {
        fireEvent.click(screen.getByText("Start Game"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("Sort by Rank"));
      });
      expect(fetch.mock.calls[4]).toEqual(["http://localhost:5050/poker/sort-hand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameID: 1,
          criteria: "rank",
          hand: [
            { suit: 'spades', rank: 2 },
            { suit: 'spades', rank: 3 },
            { suit: 'spades', rank: 4 },
            { suit: 'spades', rank: 5 },
            { suit: 'spades', rank: 6 },
            { suit: 'spades', rank: 7 },
            { suit: 'spades', rank: 8 },
            { suit: 'spades', rank: 9 },
          ],
        }),
      }]);
      expect(screen.getByAltText("2 of hearts")).toBeInTheDocument();
      expect(screen.getByAltText("3 of hearts")).toBeInTheDocument();
      expect(screen.getByAltText("4 of hearts")).toBeInTheDocument();
      expect(screen.getByAltText("5 of hearts")).toBeInTheDocument();
      expect(screen.getByAltText("6 of hearts")).toBeInTheDocument();
      expect(screen.getByAltText("7 of hearts")).toBeInTheDocument();
      expect(screen.getByAltText("8 of hearts")).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByText("Sort by Suit"));
      });
      expect(fetch.mock.calls[5]).toEqual(["http://localhost:5050/poker/sort-hand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameID: 1,
          criteria: "suit",
          hand: [
            { suit: 'hearts', rank: 2 },
            { suit: 'hearts', rank: 3 },
            { suit: 'hearts', rank: 4 },
            { suit: 'hearts', rank: 5 },
            { suit: 'hearts', rank: 6 },
            { suit: 'hearts', rank: 7 },
            { suit: 'hearts', rank: 8 },
            { suit: 'hearts', rank: 9 },
          ],
        }),
      }]);
      expect(screen.getByAltText("2 of diamonds")).toBeInTheDocument();
      expect(screen.getByAltText("3 of diamonds")).toBeInTheDocument();
      expect(screen.getByAltText("4 of diamonds")).toBeInTheDocument();
      expect(screen.getByAltText("5 of diamonds")).toBeInTheDocument();
      expect(screen.getByAltText("6 of diamonds")).toBeInTheDocument();
      expect(screen.getByAltText("7 of diamonds")).toBeInTheDocument();
      expect(screen.getByAltText("8 of diamonds")).toBeInTheDocument();
    });

    test("Make sure play hand works correctly", async () => {
      const mockUsername = "testUser";
      
      fetchUserLimits.mockResolvedValueOnce( {timeLimit: 100, moneyLimit: 100, timeSpent: 0, moneySpent: 0} );
      fetch
        .mockResolvedValueOnce({test: "test"})  /*Bet*/
        .mockResolvedValueOnce({  /*Start game*/
          ok: true,
          json: async () => ({
            gameID: 1,
            playerHand: [
              { suit: 'spades', rank: 2 },
              { suit: 'spades', rank: 3 },
              { suit: 'spades', rank: 4 },
              { suit: 'spades', rank: 5 },
              { suit: 'spades', rank: 6 },
              { suit: 'spades', rank: 7 },
              { suit: 'spades', rank: 8 },
              { suit: 'spades', rank: 9 },
            ],
            handsRemaining: 4,
            discardsRemaining: 3,
            gameOver: false,
            difficulty: 'easy',
            targetScore: 500,
          }),
        })
        .mockResolvedValueOnce({  /*update money spent*/
          ok: true,
          json: async () => ({"success":true,"message":"Money spent updated successfully","updatedDailyMoneySpent":1}),
        })
        .mockResolvedValueOnce({  /*handle transaction*/
          ok: true,
          json: async () => ({"success":true}),
        })
        .mockResolvedValueOnce({  /*score*/
          ok: true,
          json: async () => ({"score":"High Card (Score: 2)","currentScore":2,"handsRemaining":3,"discardsRemaining":3,"gameOver":false}),
        })
        .mockResolvedValueOnce({  /*draw*/
          ok: true,
          json: async () => ({"newCards":[{"suit":"spades","rank":10}]}),
        })
        .mockResolvedValueOnce({  /*score*/
          ok: true,
          json: async () => ({"score":"High Card (Score: 10)","currentScore":12,"handsRemaining":0,"discardsRemaining":3,"gameOver":false}),
        })
        

      await act(async () => {
          render(
              <Router>
                  <Poker username={mockUsername} />
              </Router>
          );
      });

      const betInput = screen.getByDisplayValue(0);    
      fireEvent.change(betInput, { target: { value: 1 } });
      expect(betInput.value).toBe("1");

      await act(async () => {
        fireEvent.click(screen.getByText("Start Game"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("Play Hand"));
      });
      expect(window.alert).toHaveBeenCalledWith("No cards selected to play!");

      await act(async () => {
        fireEvent.click(screen.getByAltText("2 of spades"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("Play Hand"));
      });
      expect(screen.getByText("High Card (Score: 2)")).toBeInTheDocument();
      expect(screen.getByAltText("10 of spades")).toBeInTheDocument();
      expect(screen.getByText("Hands Remaining: 3")).toBeInTheDocument();
    });

    test("Make sure losing works correctly", async () => {
      const mockUsername = "testUser";
      
      fetchUserLimits.mockResolvedValueOnce( {timeLimit: 100, moneyLimit: 100, timeSpent: 0, moneySpent: 0} );
      fetch
        .mockResolvedValueOnce({test: "test"})  /*Bet*/
        .mockResolvedValueOnce({  /*Start game*/
          ok: true,
          json: async () => ({
            gameID: 1,
            playerHand: [
              { suit: 'spades', rank: 2 },
              { suit: 'spades', rank: 3 },
              { suit: 'spades', rank: 4 },
              { suit: 'spades', rank: 5 },
              { suit: 'spades', rank: 6 },
              { suit: 'spades', rank: 7 },
              { suit: 'spades', rank: 8 },
              { suit: 'spades', rank: 9 },
            ],
            handsRemaining: 4,
            discardsRemaining: 3,
            gameOver: false,
            difficulty: 'easy',
            targetScore: 500,
          }),
        })
        .mockResolvedValueOnce({  /*update money spent*/
          ok: true,
          json: async () => ({"success":true,"message":"Money spent updated successfully","updatedDailyMoneySpent":1}),
        })
        .mockResolvedValueOnce({  /*handle transaction*/
          ok: true,
          json: async () => ({"success":true}),
        })
        .mockResolvedValueOnce({  /*score*/
          ok: true,
          json: async () => ({"score":"High Card (Score: 2)","currentScore":2,"handsRemaining":0,"discardsRemaining":3,"gameOver":true}),
        });
        

      await act(async () => {
          render(
              <Router>
                  <Poker username={mockUsername} />
              </Router>
          );
      });

      const betInput = screen.getByDisplayValue(0);    
      fireEvent.change(betInput, { target: { value: 1 } });
      expect(betInput.value).toBe("1");

      await act(async () => {
        fireEvent.click(screen.getByText("Start Game"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("Play Hand"));
      });
      expect(window.alert).toHaveBeenCalledWith("No cards selected to play!");

      await act(async () => {
        fireEvent.click(screen.getByAltText("2 of spades"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("Play Hand"));
      });
      expect(screen.getByText("Game Over!")).toBeInTheDocument();
      expect(screen.getByText("Your final score: 2")).toBeInTheDocument();
      expect(screen.getByText("Sorry, you lost $1.", {exact: false})).toBeInTheDocument();
    });

    test("Make sure winning works correctly", async () => {
      const mockUsername = "testUser";
      
      fetchUserLimits.mockResolvedValueOnce( {timeLimit: 100, moneyLimit: 100, timeSpent: 0, moneySpent: 0} );
      fetch
        .mockResolvedValueOnce({test: "test"})  /*Bet*/
        .mockResolvedValueOnce({  /*Start game*/
          ok: true,
          json: async () => ({
            gameID: 1,
            playerHand: [
              { suit: 'spades', rank: 2 },
              { suit: 'spades', rank: 3 },
              { suit: 'spades', rank: 4 },
              { suit: 'spades', rank: 5 },
              { suit: 'spades', rank: 6 },
              { suit: 'spades', rank: 7 },
              { suit: 'spades', rank: 8 },
              { suit: 'spades', rank: 9 },
            ],
            handsRemaining: 4,
            discardsRemaining: 3,
            gameOver: false,
            difficulty: 'easy',
            targetScore: 500,
          }),
        })
        .mockResolvedValueOnce({  /*update money spent*/
          ok: true,
          json: async () => ({"success":true,"message":"Money spent updated successfully","updatedDailyMoneySpent":1}),
        })
        .mockResolvedValueOnce({  /*handle transaction*/
          ok: true,
          json: async () => ({"success":true}),
        })
        .mockResolvedValueOnce({  /*score*/
          ok: true,
          json: async () => ({"score":"High Card (Score: 600)","currentScore":600,"handsRemaining":0,"discardsRemaining":3,"gameOver":false}),
        })
        .mockResolvedValueOnce({  /*score*/
          ok: true,
          json: async () => ({"balance":100,"success":true}),
        });
        

      await act(async () => {
          render(
              <Router>
                  <Poker username={mockUsername} />
              </Router>
          );
      });

      const betInput = screen.getByDisplayValue(0);    
      fireEvent.change(betInput, { target: { value: 1 } });
      expect(betInput.value).toBe("1");

      await act(async () => {
        fireEvent.click(screen.getByText("Start Game"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("Play Hand"));
      });
      expect(window.alert).toHaveBeenCalledWith("No cards selected to play!");

      await act(async () => {
        fireEvent.click(screen.getByAltText("2 of spades"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("Play Hand"));
      });
      expect(screen.getByText("Game Over!")).toBeInTheDocument();
      expect(screen.getByText("Your final score: 600")).toBeInTheDocument();
      expect(screen.getByText("Congratulations! You won $2!")).toBeInTheDocument();
    });
});
