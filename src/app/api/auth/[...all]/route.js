import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

let _handlers = null;

async function ensureHandlers() {
  if (!_handlers) {
    const auth = await getAuth();
    _handlers = toNextJsHandler(auth);
  }
  return _handlers;
}

export async function GET(request) {
  const handlers = await ensureHandlers();
  return handlers.GET(request);
}

export async function POST(request) {
  const handlers = await ensureHandlers();
  return handlers.POST(request);
}
