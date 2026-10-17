import { json, validSession } from "../../_utils.js";
export async function onRequestGet({ request, env }) {
  return json({ authenticated: await validSession(request, env) });
}
