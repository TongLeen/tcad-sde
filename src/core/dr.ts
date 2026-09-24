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

const define_refeval_window = (
    name: string,
    shape: "Line" | "Rectangle" | "Cuboid",
    p0: Position,
    p1: Position,
) => `(sdedr:define-refeval-window "${name}" "${shape}" ${p0.sde} ${p1.sde})`;

// *********** constant profile **************

type Decay = {
    distribute: "Erf" | "Gauss";
    factor: number;
};
type Replace = "Replace" | "LocalReplace" | "NoReplace";

const define_constant_profile = (name: string, dopant: string, conc: number) =>
    `(sdedr:define-constant-profile "${name}" "${dopant}" ${conc})`;

const define_constant_profile_placement = (
    name: string,
    dop_name: string,
    wid_name: string,
    decay?: Decay,
    replace?: Replace,
) =>
    `(sdedr:define-constant-profile-placement "${name}" "${dop_name}" "${wid_name}" ${formatDecayReplace(decay, replace)})`;

const define_constant_profile_region = (
    name: string,
    dop_name: string,
    reg_name: string,
    decay?: Decay,
    replace?: Replace,
) =>
    `(sdedr:define-constant-profile-region "${name}" "${dop_name}" "${reg_name}" ${formatDecayReplace(decay, replace)})`;

const define_constant_profile_material = (
    name: string,
    dop_name: string,
    material: string,
    decay?: Decay,
    replace?: Replace,
) =>
    `(sdedr:define-constant-profile-material "${name}" "${dop_name}" "${material}" ${formatDecayReplace(decay, replace)})`;

type GaussianLateral = {
    dist: "Gauss" | "Erf";
    factor: number;
};

type gaussionParams = {
    name: string;
    dopant: string;
    peak_depth: number;
    lateral?: GaussianLateral;
} & (
    | {
          kind: "conc";
          peak_conc: number;
          another_conc: number;
          another_depth: number;
      }
    | { kind: "dose"; dose: number; std_dev: number }
);

const define_gaussian_profile = ({
    name,
    dopant,
    peak_depth,
    lateral,
    ...kw
}: gaussionParams) => {
    let retval: string[] = [
        `"${name}"`,
        `"${dopant}"`,
        '"PeakPos"',
        `${peak_depth}`,
    ];

    if (kw.kind === "conc") {
        retval.push(
            `"PeakVal" ${kw.peak_conc}`,
            `"ValueAtDepth" ${kw.another_conc}`,
            `"Depth" ${kw.another_depth}`,
        );
    } else {
        retval.push(`"Dose" ${kw.dose}`, `"StdDev" ${kw.std_dev}`);
    }

    if (lateral !== undefined) {
        retval.push(`"${lateral.dist}"`, '"Factor"', `${lateral.factor}`);
    }

    return `(sdedr:define-gaussian-profile ${retval.join(" ")})`;
};

type GaussianPolar = "Positive" | "Negative" | "Both";
const define_analytical_profile_placement = (
    name: string,
    dop_name: string,
    wid_name: string,
    polar: GaussianPolar,
    eval_at_baseline: boolean = true,
    replace: Replace = "NoReplace",
) =>
    `(sdedr:define-analytical-profile-placement "${name}" "${dop_name}" "${wid_name}" "${polar}" "${replace}" "${eval_at_baseline ? "Eval" : "NoEval"}")`;

const define_refinement_size = (
    name: string,
    dx: [number, number],
    dy: [number, number],
    dz?: [number, number],
) => {
    let retval: number[] = [];
    retval.push(Math.max(...dx), Math.max(...dy));
    if (dz !== undefined) {
        retval.push(Math.max(...dz));
    }
    retval.push(Math.min(...dx), Math.min(...dy));
    if (dz !== undefined) {
        retval.push(Math.min(...dz));
    }
    return `(sdedr:define-refinement-size "${name}" ${retval.map((v) => `${v}`).join(" ")})`;
};

const define_refinement_placement = (
    name: string,
    rfn_name: string,
    wid_name: string,
) =>
    `(sdedr:define-refinement-placement "${name}" "${rfn_name}" "${wid_name}")`;

const define_refinement_material = (
    name: string,
    rfn_name: string,
    material: string,
) => `(sdedr:define-refinement-material "${name}" "${rfn_name}" "${material}")`;

const define_refinement_region = (
    name: string,
    rfn_name: string,
    region: string,
) => `(sdedr:define-refinement-region "${name}" "${rfn_name}" "${region}")`;

type RefinementFunction =
    | { func: "MaxTransDiff"; value: number }
    | {
          func: "MaxLenInt";
          interface: [string, string];
          value: number;
          factor: number;
          double_side?: boolean;
          use_region_names?: boolean;
      };

const define_refinement_function = (
    rfn_name: string,
    func: RefinementFunction,
) => {
    let retval: string[] = [];
    switch (func.func) {
        case "MaxLenInt":
            retval.push('"MaxLenInt"');
            let if_name = func.use_region_names
                ? (func.interface.map((v) => `${v}.region`) as [string, string])
                : func.interface;
            retval.push(
                ...if_name.map((v) => `"${v}"`),
                func.value.toString(),
                func.factor.toString(),
            );
            if (func.double_side === true) {
                retval.push('"DoubleSide"');
            }
            if (func.use_region_names === true) {
                retval.push('"UseRegionNames"');
            }
            break;
        case "MaxTransDiff":
            retval.push(`"DopingConcentration" "MaxTransDiff" ${func.value}`);
            break;
    }
    return `(sdedr:define-refinement-function "${rfn_name}" ${retval.join(" ")})`;
};

const offset_block = (
    maxlevel: number,
    kind: "material" | "region",
    a0: string,
) => `(sdedr:offset-block "${kind}" "${a0}" "maxlevel" ${maxlevel})`;

const offset_interface = (
    value: number,
    factor: number,
    kind: "material" | "region",
    interface_: [string, string],
) =>
    `(sdedr:offset-interface "${kind}" "${interface_[0]}" "${interface_[1]}" "hlocal" ${value} "factor" ${factor})`;

export {
    define_refeval_window,
    define_constant_profile,
    define_constant_profile_placement,
    define_constant_profile_region,
    define_constant_profile_material,
    define_gaussian_profile,
    define_analytical_profile_placement,
    define_refinement_size,
    define_refinement_placement,
    define_refinement_material,
    define_refinement_region,
    define_refinement_function,
    offset_block,
    offset_interface,
};

export type {
    Decay,
    Replace,
    GaussianLateral,
    GaussianPolar,
    RefinementFunction,
};

const formatDecayReplace = (decay?: Decay, replace?: Replace) => {
    let retval: string[] = [];
    if (decay !== undefined) {
        retval.push(
            decay.distribute === "Erf"
                ? `${decay.factor}`
                : `${decay.factor} "Gauss"`,
        );
    }
    if (replace !== undefined) {
        if (decay === undefined && replace !== "NoReplace") retval.push("0");
        retval.push(replace === "NoReplace" ? "" : `"${replace}"`);
    }

    return retval.join(" ");
};
