import type { Position } from "../utils";

const create_rectangle = (
    p0: Position,
    p1: Position,
    material: string,
    name: string,
) => `(sdegeo:create-rectangle ${p0.sde} ${p1.sde} "${material}" "${name}")`;
const create_polygon = (
    positions: Position[],
    material: string,
    name: string,
) =>
    `(sdegeo:create-polygon (list ${positions.map((v) => v.sde).join(" ")}) "${material}" "${name}")`;

const bool_unite = (entity_ids: string[]) =>
    `(sdegeo:bool-unite (list ${entity_ids.join(" ")}))`;

const fillet_2d = (entity_id: string, r: number) =>
    `(sdegeo:fillet-2d (list ${entity_id}) ${r})`;

const find_vertex_id = (p: Position) => `(car (find-vertex-id ${p.sde}))`;
const find_edge_id = (p: Position) => `(car (find-edge-id ${p.sde}))`;
const find_body_id = (p: Position) => `(car (find-body-id ${p.sde}))`;

const define_contact_set = (name: string) =>
    `(sdegeo:define-contact-set "${name}" 8 (color:rgb 1 0 0) "##")`;

const set_contact = (
    entity_id: string,
    contact_name: string,
    remove: boolean = false,
) =>
    `(sdegeo:set-contact ${entity_id} "${contact_name}" ${remove ? '"remove"' : ""})`;

export {
    create_rectangle,
    create_polygon,
    bool_unite,
    fillet_2d,
    find_vertex_id,
    find_edge_id,
    find_body_id,
    define_contact_set,
    set_contact,
};
