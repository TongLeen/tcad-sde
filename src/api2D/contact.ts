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
    define_contact_set,
    set_contact,
    find_body_id,
    find_edge_id,
} from "../core/geo";

const contact = (ctx: string[]) => {
    type ContactType = {
        position: Position;
        shape: "body" | "edge";
        remove?: boolean;
    };

    let contact_names: string[] = [];

    type addParams = {
        name: string;
        contacts: ContactType[];
    };
    const add = ({ name, contacts }: addParams) => {
        if (!contact_names.includes(name)) {
            contact_names.push(name);
            ctx.push(define_contact_set(name));
        }
        contacts.map(({ position, shape, remove = false }) => {
            ctx.push(
                set_contact(
                    shape === "edge"
                        ? find_edge_id(position)
                        : find_body_id(position),
                    name,
                    remove,
                ),
            );
        });
    };

    return { add };
};

export default contact;
