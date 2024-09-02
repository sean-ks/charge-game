class Charge extends Action {
    constructor(type, cost) {
        super(type, cost);
    }
    static playerCharge(player) {
        player.charges = player.charges + 1;
    }
}