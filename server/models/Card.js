class Card{
    constructor(suit, rank){
        this.suit = suit;
        this.rank = rank;
    }

    getSuit(){
        return this.suit;
    }
    getRank(){
        return this.rank;
    }
}

export default Card;