const Deck = require("../Models/Deck.js");

class PokerGame {
    constructor(id, difficulty = "easy") {
        this.player = null;
        this.deck = new Deck();
        this.id = id;
        this.started = false;
        this.gameOver = false;
        this.playerHand = [];
        this.scoredHand = [];
        this.currentScore = 0;
        this.handsRemaining = 4;
        this.discardsRemaining = 3;
        this.difficulty= difficulty;
        this.targetScore = 200;
    }

    /*
    Start the game of poker
    */
    startGame() {
        this.started = true;
        this.playerHand = this.deck.dealCard(8);
        this.handsRemaining = 4;
        this.discardsRemaining = 3;

        if (this.difficulty === "easy") {
            this.targetScore = 500;
        } else if (this.difficulty === "medium") {
            this.targetScore = 1000;
        } else {
            this.targetScore = 1500;
        }
    }

    /*
    Returns the array of cards in the players hand
    */
    getPlayerHand() {
        return this.playerHand;
    }

    /*
    Returns the score of the hand played
    */
    scoreHand(hand) {
        if (this.handsRemaining <= 0) {
            this.gameOver = true;
            return "Game Over";
        }

        const rankCounts = {};
        const suitCounts = {};
        const ranksInHand = [];

        const rankMap = {
            "2": 2,
            "3": 3,
            "4": 4,
            "5": 5,
            "6": 6,
            "7": 7,
            "8": 8,
            "9": 9,
            "10": 10,
            "Jack": 11,
            "Queen": 12,
            "King": 13,
            "Ace": 14,
        };

        // Count ranks and suits, and populate ranksInHand
        hand.forEach((card) => {
            const rank = typeof card.rank === "string" ? rankMap[card.rank] : card.rank;
            rankCounts[rank] = (rankCounts[rank] || 0) + 1;
            suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
            ranksInHand.push(rank);
        });

        const ranks = Object.values(rankCounts);
        const suits = Object.values(suitCounts);

        ranksInHand.sort((a, b) => a - b);

        const isFlush = suits.includes(5);
        const isStraight = ranksInHand.length === 5 && ranksInHand[4] - ranksInHand[0] === 4 && new Set(ranksInHand).size === 5;
        const isAceLowStraight = ranksInHand.includes(14) && ranksInHand.includes(2) && ranksInHand.includes(3) && ranksInHand.includes(4) && ranksInHand.includes(5);

        let handType = "High Card";
        let multiplier = 1;
        let contributingCards = []; // Cards contributing to the scored hand

        // Determine the hand type, multiplier, and contributing cards
        if (isFlush && (isStraight || isAceLowStraight)) {
            handType = "Straight Flush";
            multiplier = 10;
            contributingCards = hand;
        } else if (isFlush) {
            handType = "Flush";
            multiplier = 6;
            contributingCards = hand;
        } else if (isStraight || isAceLowStraight) {
            handType = "Straight";
            multiplier = 5;
            contributingCards = hand;
        } else if (ranks.includes(4)) {
            handType = "Four of a Kind";
            multiplier = 8;
            const fourOfAKindRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 4);
            contributingCards = hand.filter((card) => rankMap[card.rank] === parseInt(fourOfAKindRank));
        } else if (ranks.includes(3) && ranks.includes(2)) {
            handType = "Full House";
            multiplier = 7;
            const threeOfAKindRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 3);
            const pairRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 2);
            contributingCards = hand.filter(
                (card) => rankMap[card.rank] === parseInt(threeOfAKindRank) || rankMap[card.rank] === parseInt(pairRank)
            );
        } else if (ranks.includes(3)) {
            handType = "Three of a Kind";
            multiplier = 4;
            const threeOfAKindRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 3);
            contributingCards = hand.filter((card) => rankMap[card.rank] === parseInt(threeOfAKindRank));
        } else if (ranks.filter((count) => count === 2).length === 2) {
            handType = "Two Pair";
            multiplier = 3;
            const pairRanks = Object.keys(rankCounts).filter((rank) => rankCounts[rank] === 2);
            contributingCards = hand.filter((card) => pairRanks.includes(rankMap[card.rank].toString()));
        } else if (ranks.includes(2)) {
            handType = "Pair";
            multiplier = 2;
            const pairRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 2);
            contributingCards = hand.filter((card) => rankMap[card.rank] === parseInt(pairRank));
        } else {
            handType = "High Card";
            multiplier = 1;
            const highestCardRank = Math.max(...ranksInHand);
            contributingCards = hand.filter((card) => rankMap[card.rank] === highestCardRank);
        }

        // Calculate the chip value for the contributing cards
        let chipValue = 0;
        contributingCards.forEach((card) => {
            chipValue += rankMap[card.rank];
        });

        // Calculate the total score for the hand
        const handScore = chipValue * multiplier;
        this.currentScore += handScore;
        this.handsRemaining--;

        console.log(handScore);

        return `${handType} (Score: ${handScore})`;
    }

    /*
    Discard the input cards from the players hand
    */
    discardCards(cardsToDiscard) {
        if (this.discardsRemaining <= 0) {
            return "No discards remaining.";
        }

        // Remove the selected cards from the player's hand
        this.playerHand = this.playerHand.filter(
            (card) => !cardsToDiscard.some(
                (discardedCard) => discardedCard.rank === card.rank && discardedCard.suit === card.suit
            )
        );

        // Draw new cards to replace the discarded ones
        const newCards = this.deck.dealCard(cardsToDiscard.length);
        this.playerHand.push(...newCards);

        this.discardsRemaining--;
        return "Cards discarded successfully.";
    }

    endGame() {
        this.gameOver = true;
    }
}

module.exports = PokerGame;