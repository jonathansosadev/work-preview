import Localbase from "localbase";

let db = new Localbase("db");

db.config.debug = false;

export const storage = { db };
