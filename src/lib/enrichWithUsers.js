import { findUsersByIds } from "./users";

function pickUserFields(user, fields) {
  if (!user) return null;
  return fields.reduce((acc, field) => {
    acc[field] = user[field];
    return acc;
  }, {});
}

export async function enrichWithUsers(
  items,
  { userField = "user", fields = ["displayName", "userName", "img"] } = {}
) {
  const list = items.map((item) => (item?.toObject ? item.toObject() : { ...item }));
  const ids = list.map((item) => {
    const value = item[userField];
    return value?.id || value?.toString?.() || value;
  });

  const users = await findUsersByIds(ids);
  const map = new Map(users.map((user) => [user.id, user]));

  return list.map((item) => {
    const rawId = item[userField]?.id || item[userField]?.toString?.() || item[userField];
    const user = map.get(String(rawId));
    return {
      ...item,
      [userField]: pickUserFields(user, fields),
    };
  });
}
