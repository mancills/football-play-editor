export default class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    vectorTo(otherPoint) {
        return new Vector2(otherPoint.x - this.x, otherPoint.y - this.y);
    }

    angleTo(otherPoint) {
        //up is zero for svg.js elements
        return (
            (Math.atan2(this.y - otherPoint.y, this.x - otherPoint.x) * 180) /
                Math.PI +
            180
        );
    }

    adjustedAngleTo(otherPoint) {
        //up is zero for svg.js elements
        return (
            ((Math.atan2(this.y - otherPoint.y, this.x - otherPoint.x) * 180) /
                Math.PI +
                270) %
            360
        );
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dot(otherVector) {}

    normalize() {
        let len = this.length();
        return new Vector2(this.x / len, this.y / len);
    }

    toArray() {
        return [this.x, this.y];
    }

    // offset(angle, length) {
    //     return new Vector2(
    //         length * Math.sin(angle) + this.x,
    //         length * Math.cos(angle) + this.y
    //     );
    // }
    offset(angle, distance) {
        return new Vector2(
            Math.round(Math.cos((angle * Math.PI) / 180) * distance + this.x),
            Math.round(Math.sin((angle * Math.PI) / 180) * distance + this.y)
        );
    }

    static dot(normVec1, normVec2) {
        return normVec1.x * normVec2.x + normVec1.y * normVec2.y;
    }
}
