import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const remindTimer = 60000; // 60 seconds

const GamblingReminders = () => {
  useEffect(() => {
    const gamblingFacts = [
      "Gambling can be addictive. Set limits and stick to them.",
      "Remember to take regular breaks while gambling.",
      "Never gamble with money you can't afford to lose.",
      "If you feel you have a gambling problem, seek help immediately.",
      "Gambling should be fun, not a way to make money.",
      "Set a budget for gambling and stick to it.",
      "Don't chase your losses.",
      "Balance gambling with other activities.",
      "Know the odds and understand the game.",
      "Take frequent breaks to avoid fatigue."
    ];

    let lastFact = "";
    /*
    Gets a random fact from the predefined facts
    Ensures we do not return the same fact twice in a row
    */
    const getRandomFact = () => {
      let newFact;
      do {
        newFact = gamblingFacts[Math.floor(Math.random() * gamblingFacts.length)];
      } while (newFact === lastFact); //Ensures we don't return the same fact every time
      lastFact = newFact;
      return newFact;
    };

    const showGamblingFact = () => {
      toast.info(getRandomFact(), { position: "top-center" });
    };
    
    
    const intervalId = setInterval(showGamblingFact, remindTimer); // Show a fact every 60 seconds


    return () => clearInterval(intervalId);
  }, []);

  return null; 
};

export default GamblingReminders;