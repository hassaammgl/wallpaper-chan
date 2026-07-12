import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import clientPromise from "./mongodb";

let _auth = null;

export function getAuth() {
  if (_auth) return _auth;

  _auth = betterAuth({
    database: mongodbAdapter(
      clientPromise.then((c) => c.db())
    ),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
    },
    user: {
      additionalFields: {
        displayName: {
          type: "string",
          required: false,
        },
        userName: {
          type: "string",
          required: true,
          unique: true,
        },
        img: {
          type: "string",
          required: false,
        },
        role: {
          type: "string",
          required: true,
          default: "user",
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
        strategy: "compact",
      },
    },
    plugins: [nextCookies()],
  });

  return _auth;
}
