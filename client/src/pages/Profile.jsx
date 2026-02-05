import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Shield, Award, Star, Flame, LogOut, Loader2, Activity, Users, Globe, ExternalLink, ShieldCheck } from "lucide-react";

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAvatar = (user) => {
    const seed = user?.avatar || user?.name || "contest.com";
    // Using big-ears-neutral for an animal-style look as requested
    return `https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear,solid`;
  };

  const fetchStats = async () => {
    try {
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profData = await api.profile();
        setProfile(profData);
        
        // Admins and Participants both use stats now for the "healthy competition"
        await fetchStats();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();

    window.addEventListener('projectUpdated', fetchStats);
    return () => window.removeEventListener('projectUpdated', fetchStats);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const isAdmin = true; // Gate checking is now handled by the passcode in AdminRoute

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden group"
      >
        <div className="card bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 border-white/10 p-8 md:p-12">
          <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl group-hover:blur-2xl transition-all">
            <User className="h-64 w-64 text-emerald-500" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-zinc-900 flex items-center justify-center shadow-2xl shadow-emerald-500/20 border-4 border-zinc-900 overflow-hidden"
            >
              <img src={getAvatar(profile)} alt={profile?.name} className="w-full h-full object-cover" />
            </motion.div>
            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-white">{profile?.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    contest.com
                  </div>
                  {(profile?.role === 'admin' || sessionStorage.getItem("admin_session") === "true") && (
                    <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1.5 animate-pulse">
                      <ShieldCheck className="h-3 w-3" /> System Admin
                    </div>
                  )}
                </div>
              </div>
              <p className="flex items-center justify-center md:justify-start gap-2 text-zinc-400 font-medium">
                <Mail className="h-4 w-4" />
                {profile?.email}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card bg-zinc-900 border-white/5 p-6 hover:border-emerald-500/30 transition-all group">
          <Award className="h-8 w-8 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
          <p className="text-3xl font-black text-white">{profile?.totalPoints || 0}</p>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Consistency Points</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card bg-zinc-900 border-white/5 p-6 hover:border-emerald-500/30 transition-all group">
          <Flame className="h-8 w-8 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
          <p className="text-3xl font-black text-white">{profile?.streak || 0}d</p>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Current Streak</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card bg-zinc-900 border-white/5 p-6 hover:border-emerald-500/30 transition-all group">
          <Star className="h-8 w-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
          <p className="text-3xl font-black text-white">{profile?.latestRating || 0}</p>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Last Match Heat</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          System Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isAdmin && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card border-2 border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-20 w-20 text-emerald-400" />
              </div>
              <div className="relative z-10 p-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-emerald-400" />
                  Admin Control Center
                </h3>
                <p className="text-sm text-zinc-400 mb-6 max-w-xs">Manage projects, verify participants, and oversee the global arena leaderboard.</p>
                <Link 
                  to="/admin" 
                  className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-emerald-500 text-white font-black uppercase text-xs tracking-widest text-center shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition-all active:scale-95"
                >
                  Enter Command HQ
                </Link>
              </div>
            </motion.div>
          )}

          <div className="card border-white/5 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-zinc-400" />
              Account Security
            </h3>
            <p className="text-sm text-zinc-500 mb-6">Registered {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}. Session secured via JWT.</p>
            <button 
              onClick={logout}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold group w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
