import { getAuth } from "./auth";
import { headers } from "next/headers";

export async function getSession() {
  const headersList = await headers();
  const plainHeaders = Object.fromEntries(headersList.entries());
  const session = await (await getAuth()).api.getSession({
    headers: plainHeaders,
  });

  if (session?.user?.blocked) {
    return null;
  }

  return session;
}
