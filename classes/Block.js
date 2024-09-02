class Block extends Action {
    blockAmt;
    constructor(type, cost, blockAmt) {
        super(type, cost);
        this.blockAmt = blockAmt;
    }
    get blockAmt() {
        return this.blockAmt;
    }
    set blockAmt(value) {
        this.blockAmt = value;
    }
}