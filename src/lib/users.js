import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

function usersCollection() {
  return clientPromise.then((client) => client.db().collection("user"));
}

function isObjectId(value) {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}

function userIdQuery(id) {
  const clauses = [{ id: String(id) }];
  if (isObjectId(id)) clauses.push({ _id: new ObjectId(id) });
  return { $or: clauses };
}

export function normalizeUser(doc) {
  if (!doc) return null;
  const id = doc.id || doc._id?.toString();
  return {
    id,
    _id: id,
    displayName: doc.displayName || doc.name,
    userName: doc.userName,
    email: doc.email,
    img: doc.img,
    role: doc.role || "user",
    blocked: !!doc.blocked,
    createdAt: doc.createdAt,
  };
}

export async function findUserByUserName(userName) {
  const users = await usersCollection();
  const doc = await users.findOne({ userName });
  return normalizeUser(doc);
}

export async function findUserById(id) {
  if (!id) return null;
  const users = await usersCollection();
  const doc = await users.findOne(userIdQuery(id));
  return normalizeUser(doc);
}

export async function findUsersByIds(ids) {
  const unique = [...new Set(ids.map(String).filter(Boolean))];
  if (!unique.length) return [];

  const objectIds = unique.filter(isObjectId).map((id) => new ObjectId(id));
  const stringIds = unique.filter((id) => !isObjectId(id));

  const or = [];
  if (stringIds.length) or.push({ id: { $in: stringIds } });
  if (objectIds.length) or.push({ _id: { $in: objectIds } });

  const users = await usersCollection();
  const docs = await users.find({ $or: or }).toArray();
  return docs.map(normalizeUser);
}

export async function listUsers({ search, limit = 15, offset = 0, blocked } = {}) {
  const filter = {};
  if (search) {
    filter.$or = [
      { userName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { displayName: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
    ];
  }
  if (blocked !== undefined) filter.blocked = blocked;

  const users = await usersCollection();
  const [docs, total] = await Promise.all([
    users.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
    users.countDocuments(filter),
  ]);

  return { users: docs.map(normalizeUser), total };
}

export async function getBlockedUserIds() {
  const users = await usersCollection();
  const docs = await users
    .find({ blocked: true }, { projection: { id: 1 } })
    .toArray();
  return docs.map((doc) => doc.id || doc._id?.toString()).filter(Boolean);
}

export async function updateUserById(id, fields) {
  const users = await usersCollection();
  const update = { ...fields, updatedAt: new Date() };

  if (update.displayName !== undefined) {
    update.name = update.displayName;
  }

  if (update.userName !== undefined) {
    const taken = await users.findOne({ userName: update.userName });
    if (taken) {
      const current = await users.findOne(userIdQuery(id));
      if (!current || taken._id?.toString() !== current._id?.toString()) {
        const err = new Error("Username already taken");
        err.status = 409;
        throw err;
      }
    }
  }

  const result = await users.updateOne(userIdQuery(id), { $set: update });
  if (result.matchedCount === 0) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return findUserById(id);
}

export async function deleteUserById(id) {
  const users = await usersCollection();
  await users.deleteOne(userIdQuery(id));
}

export async function countUsers() {
  const users = await usersCollection();
  return users.countDocuments();
}

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
