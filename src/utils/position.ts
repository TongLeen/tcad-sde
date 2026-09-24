// Copyright 2026 TongLeen
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
