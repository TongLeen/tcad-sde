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

import type { Position } from "../utils";
import {
    create_rectangle,
    create_polygon,
    bool_unite,
    fillet_2d,
    find_vertex_id,
    find_edge_id,
    find_body_id,
} from "../core/geo";

type NoEmptyList<T> = [T, ...T[]];

const draw = <M extends string>(ctx: string[]) => {
    type rectangleParams = {
        name: string;
        material: M;
        p0: Position;
        p1: Position;
        round?: [Position, number][];
    };
    const rectangle = ({ name, material, p0, p1, round }: rectangleParams) => {
        ctx.push(create_rectangle(p0, p1, material, `${name}.region`));

        if (round === undefined) return;
        round.map(([p, r]) => {
            ctx.push(fillet_2d(find_vertex_id(p), r));
        });
    };

    type polygonParams = {
        name: string;
        material: M;
        positions: NoEmptyList<Position>;
        round?: [Position, number][];
    };
    const polygon = ({ name, material, positions, round }: polygonParams) => {
        ctx.push(create_polygon(positions, material, `${name}.region`));

        if (round === undefined) return;
        round.map(([p, r]) => {
            ctx.push(fillet_2d(find_vertex_id(p), r));
        });
    };

    type uniteParams = {
        positions: NoEmptyList<Position>;
        name?: string;
    };
    const unite = ({ positions, name }: uniteParams) => {
        ctx.push(bool_unite(positions.map(find_body_id)));

        if (name === undefined) return;
        const id = find_body_id(positions[0]);
        ctx.push(
            `(sde:add-material ${id} (generic:get ${id} "material") "${name}.region")`,
        );
    };

    const vertex = (position: Position) => {
        ctx.push(`(sdegeo:insert-vertex ${position.sde})`);
    };

    const saveModel = (filename: string) =>
        ctx.push(`(sde:save-model "${filename}")`);

    const setOverlapBehavior = (behavior: "replace" | "keep") => {
        const behaviorMap = {
            replace: "ABA",
            keep: "BAB",
        };
        ctx.push(`(sdegeo:set-default-boolean "${behaviorMap[behavior]}")`);
    };

    const setCoordMode = (mode: "x_down" | "y_down") => {
        const modeMap = {
            x_down: "-x",
            y_down: "+z",
        };
        ctx.push(`(sde:set-process-up-direction "${modeMap[mode]}")`);
    };

    return {
        rectangle,
        polygon,
        vertex,
        unite,
        saveModel,
        setOverlapBehavior,
        setCoordMode,
    };
};

export default draw;
