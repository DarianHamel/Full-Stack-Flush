import { useEffect } from "react";
import { toast } from "react-toastify";

const GamblingReminders = () => {
  useEffect(() => {
    const gamblingFacts = [
      "Gambling can be addictive. Set limits and stick to them.",
      "Remember to take regular breaks while gambling.",
      "Never gamble with money you can't afford to lose.",
      "If you feel you have a gambling problem, seek help immediately.",
      "Gambling should be fun, not a way to make money."
    ];

    const showGamblingFact = () => {
      const randomFact = gamblingFacts[Math.floor(Math.random() * gamblingFacts.length)];
      toast.info(randomFact, { position: "top-center" });
    };

    const intervalId = setInterval(showGamblingFact, 60000); // Show a fact every 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  return null; // This component does not render anything
};

export default GamblingReminders;