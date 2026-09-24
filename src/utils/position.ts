export class Position {
    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly z: number = 0,
    ) {}

    shift({ x = 0, y = 0, z = 0 }: { x?: number; y?: number; z?: number }) {
        return new Position(this.x + x, this.y + y, this.z + z);
    }

    shiftX(x: number) {
        return this.shift({ x });
    }

    shiftY(y: number) {
        return this.shift({ y });
    }

    add(p: Position) {
        return new Position(this.x + p.x, this.y + p.y, this.z + p.z);
    }

    midpoint(p: Position) {
        return new Position(
            (this.x + p.x) / 2,
            (this.y + p.y) / 2,
            (this.z + p.z) / 2,
        );
    }

    get sde() {
        return `(position ${this.x} ${this.y} ${this.z})`;
    }
}
