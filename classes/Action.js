class Action {
    type;
    cost;
    constructor(type, cost){
        this.type = type;
        this.cost = cost;
    }

    get type() {
        return this.type;
    }

    set type(value) {
        this.type = value;
    }

    get cost() {
        return this.cost;
    }

    set cost(value) {
        this.cost = value;
    }
}