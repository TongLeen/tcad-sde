import type { Position } from "../utils";
import {
    define_refinement_size,
    define_refeval_window,
    define_refinement_placement,
    define_refinement_material,
    define_refinement_region,
    define_refinement_function,
    offset_block,
    offset_interface,
} from "../core/dr";

import type { RefinementFunction as _RefinementFunction } from "../core/dr";

const mesh = <M extends string>(ctx: string[]) => {
    type RefinementFunction =
        | { func: "MaxTransDiff"; value: number }
        | {
              func: "MaxLenInt";
              interface: [string, string];
              value: number;
              factor: number;
              double_side?: boolean;
              use_region_names: true;
          }
        | {
              func: "MaxLenInt";
              interface: [M, M];
              value: number;
              factor: number;
              double_side?: boolean;
              use_region_names?: false;
          };

    type refineParams = {
        name: string;
        dx: [number, number];
        dy: [number, number];
        func?: RefinementFunction[];
    } & (
        | { kind: "position"; rectangle: [Position, Position] }
        | { kind: "material"; material: M }
        | { kind: "region"; region: string }
    );

    const refine = ({ name, dx, dy, func, ...kw }: refineParams) => {
        ctx.push(define_refinement_size(`${name}.refine`, dx, dy));
        switch (kw.kind) {
            case "position":
                ctx.push(
                    define_refeval_window(
                        `${name}.ref`,
                        "Rectangle",
                        ...kw.rectangle,
                    ),
                    define_refinement_placement(
                        `${name}.plc_refine`,
                        `${name}.refine`,
                        `${name}.ref`,
                    ),
                );
                break;
            case "material":
                ctx.push(
                    define_refinement_material(
                        `${name}.plc_refine`,
                        `${name}.refine`,
                        kw.material,
                    ),
                );
                break;
            case "region":
                ctx.push(
                    define_refinement_region(
                        `${name}.plc_refine`,
                        `${name}.refine`,
                        `${kw.region}.region`,
                    ),
                );
                break;
        }

        if (func === undefined) return;
        ctx.push(
            ...func.map((v) => define_refinement_function(`${name}.refine`, v)),
        );
    };

    type OffsetTarget<T> = {
        target: T;
        value: number;
        factor: number;
    };

    type offsetParams = {
        maxlevel: number;
    } & (
        | { kind: "material"; material: M; targets: OffsetTarget<M>[] }
        | { kind: "region"; region: string; targets: OffsetTarget<string>[] }
    );
    const offset = ({ maxlevel, ...kw }: offsetParams) => {
        ctx.push(
            offset_block(
                maxlevel,
                kw.kind,
                kw.kind === "material" ? kw.material : `${kw.region}.region`,
            ),
        );
        ctx.push(
            ...kw.targets.map((v: OffsetTarget<string>) =>
                offset_interface(v.value, v.factor, kw.kind, [
                    kw.kind === "material"
                        ? kw.material
                        : `${kw.region}.region`,
                    v.target,
                ]),
            ),
        );
    };

    const buildMesh = (filename: string) => {
        ctx.push(`(sde:build-mesh "${filename}")`);
    };

    return {
        refine,
        offset,
        buildMesh,
    };
};

export default mesh;
