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
