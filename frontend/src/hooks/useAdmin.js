import { useState } from "react";

const KEY = "rhq_admin";

export function useAdmin() {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(KEY)) || null; }
    catch { return null; }
  });

  const login = (username, password) =>
    fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const creds = { username, password };
          sessionStorage.setItem(KEY, JSON.stringify(creds));
          setAdmin(creds);
          return true;
        }
        return false;
      });

  const logout = () => { sessionStorage.removeItem(KEY); setAdmin(null); };

  return { isAdmin: !!admin, admin, login, logout };
}

export function getAdminHeaders() {
  try {
    const c = JSON.parse(sessionStorage.getItem("rhq_admin"));
    if (c) return { username: c.username, password: c.password };
  } catch {}
  return {};
}
