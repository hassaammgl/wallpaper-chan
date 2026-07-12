import { getAuth } from "./auth";
import { headers } from "next/headers";

export async function getSession() {
  const session = await (await getAuth()).api.getSession({
    headers: await headers(),
  });

  if (session?.user?.blocked) {
    return null;
  }

  return session;
}
