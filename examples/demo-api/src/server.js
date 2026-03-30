import express from "express";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import { authenticate, canReadUser, JWT_SECRET } from "./auth.js";

const app = express();
app.use(express.json());

const USERS = {
  "u-100": { id: "u-100", email: "admin@example.com", role: "admin", ssnMasked: "***-**-1000" },
  "u-200": { id: "u-200", email: "user@example.com", role: "user", ssnMasked: "***-**-2000" }
};

app.post("/login", (req, res) => {
  console.log("login_attempt", { body: req.body });

  const user = authenticate(req.body.email, req.body.password);
  if (!user) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({ token });
});

app.get("/api/users/:id", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  const requester = token ? jwt.verify(token, JWT_SECRET) : null;
  const target = USERS[req.params.id];

  if (!target) {
    return res.status(404).json({ error: "not_found" });
  }

  if (!canReadUser(requester, req.params.id)) {
    return res.status(403).json({ error: "forbidden" });
  }

  return res.json(target);
});

app.get("/admin/users", (_req, res) => {
  return res.json(Object.values(USERS));
});

app.get("/preview", async (req, res) => {
  const targetUrl = req.query.url;
  const upstream = await fetch(targetUrl);
  const text = await upstream.text();
  return res.send(text.slice(0, 500));
});

app.listen(3000, () => {
  console.log("demo-api listening on 3000");
});

