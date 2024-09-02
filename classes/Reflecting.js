class Reflecting extends Action {
    reflectAmt;
    constructor(type, cost, reflectAmt) {
        super(type, cost);
        this.reflectAmt = reflectAmt;
    }
    get reflectAmt() {
        return this.reflectAmt;
    }

    set reflectAmt(value) {
        this.reflectAmt = value;
    }
}
