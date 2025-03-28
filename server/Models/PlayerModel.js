class Player{
    constructor(ws, id, username, bet, fakeMoney){
        this.hand = [];
        this.ws = ws;
        this.id = id;
        this.username = username;
        this.bet = bet;
        this.fakeMoney = fakeMoney;
    }

    /*
    Returns the total value of the hand
    Calculates the special case for a soft Ace
    */
    getTotal(){
        let large = 0;
        let small = 0;
        let output;
        for (const card of this.hand){
            if (card.rank === 11 || card.rank === 12 || card.rank === 13){
                large += 10;
                small += 10;
            }
            else if(card.rank <= 10){
                large += card.rank;
                small += card.rank;
            }
            //Special case for Ace
            else{
                large += 11;
                small += 1;
            }
        }
        if (large > 21){
            output = small;
        }
        else{
            output = large;
        }
        return output;
    }
}

module.exports = Player;
