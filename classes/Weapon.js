class Weapon extends Action {
    damage;
    constructor(type, cost, damage){
        super(type, cost);
        this.damage = damage;
    }
    get damage() {
        return this.damage;
    }
    set damage(value) {
        this.damage = value;
    }
}
