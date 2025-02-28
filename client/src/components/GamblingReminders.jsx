import { useEffect } from "react";
import { toast } from "react-toastify";

const remindTimer = 60000; // 60 seconds

const GamblingReminders = () => {
  useEffect(() => {
    const gamblingFacts = [
      "Gambling can be addictive. Set limits and stick to them.",
      "Remember to take regular breaks while gambling.",
      "Never gamble with money you can't afford to lose.",
      "If you feel you have a gambling problem, seek help immediately.",
      "Gambling should be fun, not a way to make money."
    ];

    let lastFact = "";
    const getRandomFact = () => {
      let newFact;
      do {
        newFact = gamblingFacts[Math.floor(Math.random() * gamblingFacts.length)];
      } while (newFact === lastFact);
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
