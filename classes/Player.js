class Player {
    name;
    health;
    charges;
    block;
    reflect;
    points;
    target;
    action;
    order;
    constructor({name, health, charges, block, reflect, points, target, action, order}){
        this.name = name;
        this.health = health;
        this.charges = charges;
        this.block = block;
        this.reflect = reflect;
        this.points = points;
        this.target = target;
        this.action = action;
        this.order = order;
    }

    get name() {
        return this.name;
    }

    set name(value) {
        this.name = value;
    }

    get health() {
        return this.health;
    }

    set health(value) {
        this.health = value;
    }

    get charges() {
        return this.charges;
    }

    set charges(value) {
        this.charges = value;
    }

    get block() {
        return this.block;
    }

    set block(value) {
        this.block = value;
    }

    get reflect() {
        return this.reflect;
    }

    set reflect(value) {
        this.reflect = value;
    }

    get points() {
        return this.points;
    }

    set points(value) {
        this.points = value;
    }

    get target() {
        return this.target;
    }

    set target(value) {
        this.target = value;
    }

    get action() {
        return this.action;
    }

    set action(value) {
        this.action = value;
    }

    get order() {
        return this.order;
    }

    set order(value) {
        this.order = value;
    }

    draw(x,y){
        ctx.fillStyle = 'black';
        ctx.fillRect(x,y, 100,100);
    }

    toString(){
        return "name: " + this.name + "\n" +
            "health: " + this.health + "\n" +
            "charges: " + this.charges + "\n" +
            "block: " + this.block + "\n" +
            "reflect: " + this.reflect + "\n" +
            "points: " + this.points + "\n" +
            "target: " + this.target + "\n" +
            "action: " + this.action.toString() + "\n" +
            "order: " + this.order + "\n";
    }
}