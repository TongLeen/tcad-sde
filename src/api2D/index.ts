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

import fs from "node:fs";
import { spawnSync } from "node:child_process";

import draw from "./draw";
import contact from "./contact";
import dop from "./dop";
import mesh from "./mesh";

const useSde = <M extends string, D extends string>() => {
    let cmds: string[] = [];

    const save = (filename: string) => {
        fs.writeFileSync(filename, cmds.join("\n"));
    };

    const run = () => {
        const stdin_data = cmds.join("\n");
        const proc = spawnSync("sde", ["-e", "-r"], {
            input: stdin_data,
            stdio: ["pipe", "inherit", "inherit"],
        });
        return proc.status ?? -1;
    };

    const runAndExit = () => {
        process.exit(run());
    };

    return {
        save,
        run,
        runAndExit,
        draw: draw<M>(cmds),
        contact: contact(cmds),
        dop: dop<M, D>(cmds),
        mesh: mesh<M>(cmds),
    };
};

export default useSde;
