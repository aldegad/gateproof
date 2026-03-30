import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { authenticate, canReadUser, JWT_SECRET } from "./auth.js";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be injected at runtime");
}

const app = express();
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const USERS = {
  "u-500": { id: "u-500", email: "admin@ready.example.com", role: "admin", ssnMasked: "***-**-5000" },
  "u-600": { id: "u-600", email: "user@ready.example.com", role: "user", ssnMasked: "***-**-6000" },
};

function readRequester(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAdmin(req, res, next) {
  const requester = readRequester(req);
  const amr = Array.isArray(requester?.amr) ? requester.amr : [];

  if (!requester || requester.role !== "admin" || !amr.includes("mfa")) {
    return res.status(403).json({ error: "forbidden" });
  }

  req.requester = requester;
  return next();
}

app.post("/login", loginLimiter, (req, res) => {
  const user = authenticate(req.body.email, req.body.passwordHash);
  if (!user) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email, amr: user.mfaRequired ? ["pwd", "mfa"] : ["pwd"] },
    JWT_SECRET,
    { expiresIn: "15m" },
  );

  return res.json({ token });
});

app.get("/api/users/:id", (req, res) => {
  const requester = readRequester(req);
  const target = USERS[req.params.id];

  if (!target) {
    return res.status(404).json({ error: "not_found" });
  }

  if (!canReadUser(requester, req.params.id)) {
    return res.status(403).json({ error: "forbidden" });
  }

  return res.json(target);
});

app.get("/admin/users", requireAdmin, (req, res) => {
  console.info("admin_user_list_viewed", {
    actor: req.requester.sub,
    route: "/admin/users",
  });

  return res.json(Object.values(USERS));
});

app.listen(3000, () => {
  console.log("kisa-ready-service listening on 3000");
});
