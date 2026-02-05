import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Key, Loader2 } from "lucide-react";

const AdminPasscodeGate = ({ onVerified }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(
    parseInt(localStorage.getItem("admin_attempts") || "0")
  );
  const [isLocked, setIsLocked] = useState(
    localStorage.getItem("admin_locked") === "true"
  );

  const SYSTEM_PASS = "friends129";
  const MAX_ATTEMPTS = 10;

  const handleVerify = (e) => {
    e.preventDefault();
    
    if (isLocked) return;

    if (passcode === SYSTEM_PASS) {
      sessionStorage.setItem("admin_session", "true");
      localStorage.setItem("admin_attempts", "0");
      setAttempts(0);
      onVerified();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("admin_attempts", newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        localStorage.setItem("admin_locked", "true");
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full card border-red-500/30 text-center space-y-6"
        >
          <div className="mx-auto h-16 w-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">System Lockout</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Administrative access has been permanently disabled due to critical authentication failures. Please contact the lead architect.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm card bg-zinc-900 border border-emerald-500/30 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 bg-emerald-500/10 blur-3xl rounded-full" />
        
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Admin Access</h2>
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Verification Layer 2 Required</p>
              <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(attempts / MAX_ATTEMPTS) * 100}%` }}
                  className={`h-full ${attempts > 7 ? 'bg-red-500' : 'bg-emerald-500'}`}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input 
                type="password"
                placeholder="••••••••"
                className={`w-full bg-zinc-950 border ${error ? 'border-red-500' : 'border-zinc-800'} rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono`}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-xs font-black uppercase tracking-widest shadow-emerald-500/20">
              Verify Credentials
            </button>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest">
                ACCESS DENIED: ATTEMPT LOGGED
              </motion.p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPasscodeGate;
