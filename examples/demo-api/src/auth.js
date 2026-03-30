export const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-change-me";

const USERS = [
  { id: "u-100", email: "admin@example.com", password: "admin1234", role: "admin" },
  { id: "u-200", email: "user@example.com", password: "password123", role: "user" }
];

export function authenticate(email, password) {
  const user = USERS.find((candidate) => candidate.email === email);
  if (!user) {
    return null;
  }

  if (user.password !== password) {
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

