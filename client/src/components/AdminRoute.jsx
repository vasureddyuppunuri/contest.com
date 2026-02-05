import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import AdminPasscodeGate from "./AdminPasscodeGate";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isPasscodeVerified, setIsPasscodeVerified] = useState(
    sessionStorage.getItem("admin_session") === "true"
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // 1. Authentication Check (MUST BE LOGGED IN)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Dual-Layer Security (PASSCODE GATE)
  if (!isPasscodeVerified) {
    return (
      <AdminPasscodeGate 
        onVerified={() => setIsPasscodeVerified(true)} 
      />
    );
  }

  return children;
};

export default AdminRoute;
