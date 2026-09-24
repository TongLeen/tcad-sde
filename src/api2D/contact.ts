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
