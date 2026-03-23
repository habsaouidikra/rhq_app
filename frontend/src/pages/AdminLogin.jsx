import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin";
import s from "./AdminLogin.module.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) navigate("/admin");
    else setError("Invalid credentials");
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>
          <span className={s.logoTif}>ⵔⵉⴽⵓ</span>
          <span className={s.logoSub}>Admin</span>
        </div>
        <h1 className={s.title}>Sign in</h1>
        <p className={s.sub}>Administrator access only</p>
        <form onSubmit={submit} className={s.form}>
          <div className={s.field}>
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className={s.input} autoComplete="username" required />
          </div>
          <div className={s.field}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={s.input} autoComplete="current-password" required />
          </div>
          {error && <div className={s.error}>{error}</div>}
          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  );
}
