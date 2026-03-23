import { Routes, Route, Navigate } from "react-router-dom";
import PublicView from "./pages/PublicView";
import SubmitPage from "./pages/SubmitPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function isAdmin() {
  try { return !!JSON.parse(sessionStorage.getItem("rhq_admin")); }
  catch { return false; }
}

function Protected({ children }) {
  return isAdmin() ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicView />} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Protected><AdminDashboard /></Protected>} />
    </Routes>
  );
}
