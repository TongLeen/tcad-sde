import type { Position } from "../utils";

import type {
    Decay,
    Replace,
    GaussianLateral,
    GaussianPolar,
} from "../core/dr";
import {
    define_refeval_window,
    define_constant_profile,
    define_constant_profile_placement,
    define_constant_profile_material,
    define_constant_profile_region,
    define_gaussian_profile,
    define_analytical_profile_placement,
} from "../core/dr";

const dop = <M extends string, D extends string>(ctx: string[]) => {
    type constantParams = {
        name: string;
        dopant: D;
        concentration: number;
        decay?: Decay;
        replace?: Replace;
    } & (
        | { kind: "position"; rectangle: [Position, Position] }
        | { kind: "material"; material: M }
        | { kind: "region"; region: string }
    );

    const constant = ({
        name,
        dopant,
        concentration,
        decay,
        replace = "NoReplace",
        ...kw
    }: constantParams) => {
        ctx.push(
            define_constant_profile(`${name}.cstdop`, dopant, concentration),
        );

        switch (kw.kind) {
            case "position":
                ctx.push(
                    define_refeval_window(
                        `${name}.ref`,
                        "Rectangle",
                        kw.rectangle[0],
                        kw.rectangle[1],
                    ),
                    define_constant_profile_placement(
                        `${name}.plc_cstdop`,
                        `${name}.cstdop`,
                        `${name}.ref`,
                        decay,
                        replace,
                    ),
                );
                break;
            case "material":
                ctx.push(
                    define_constant_profile_material(
                        `${name}.plc_cstdop`,
                        `${name}.cstdop`,
                        kw.material,
                        decay,
                        replace,
                    ),
                );
                break;
            case "region":
                ctx.push(
                    define_constant_profile_region(
                        `${name}.plc_cstdop`,
                        `${name}.cstdop`,
                        `${kw.region}.region`,
                    ),
                );
                break;
        }
    };

    type gaussionParams = {
        name: string;
        start: Position;
        end: Position;
        peak_depth: number;
        dopant: D;
        polar: GaussianPolar;
        lateral?: GaussianLateral;
        eval_at_baseline?: boolean;
        replace?: Replace;
    } & (
        | {
              kind: "conc";
              peak_conc: number;
              another_conc: number;
              another_depth: number;
          }
        | { kind: "dose"; dose: number; std_dev: number }
    );

    const gaussian = ({
        name,
        start,
        end,
        peak_depth,
        dopant,
        lateral,
        polar,
        eval_at_baseline = true,
        replace = "NoReplace",
        ...kw
    }: gaussionParams) => {
        ctx.push(
            define_refeval_window(`${name}.ref`, "Line", start, end),
            define_gaussian_profile({
                name: `${name}.alydop`,
                dopant,
                peak_depth,
                lateral,
                ...kw,
            }),
            define_analytical_profile_placement(
                `${name}.plc_alydop`,
                `${name}.alydop`,
                `${name}.ref`,
                polar,
                eval_at_baseline,
                replace,
            ),
        );
    };

    return {
        constant,
        gaussian,
    };
};

export default dop;
