import crypto from "node:crypto";

export const JWT_SECRET = process.env.JWT_SECRET;

const USERS = [
  {
    id: "u-500",
    email: "admin@ready.example.com",
    passwordHash: "pbkdf2$310000$admin-salt$admin-hash",
    role: "admin",
    mfaRequired: true,
  },
  {
    id: "u-600",
    email: "user@ready.example.com",
    passwordHash: "pbkdf2$310000$user-salt$user-hash",
    role: "user",
    mfaRequired: false,
  },
];

function safeEquals(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function authenticate(email, submittedPasswordHash) {
  const user = USERS.find((candidate) => candidate.email === email);
  if (!user) {
    return null;
  }

  if (!safeEquals(user.passwordHash, submittedPasswordHash)) {
    return null;
  }

  return user;
}

export function canReadUser(requester, targetUserId) {
  if (!requester) {
    return false;
  }

  if (requester.role === "admin") {
    return true;
  }

  return requester.id === targetUserId;
}
