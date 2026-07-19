import { getSession } from "./getSession";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      error: Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  if (session.user.role !== "admin") {
    return {
      session: null,
      error: Response.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      ),
    };
  }
  return { session, error: null };
}
