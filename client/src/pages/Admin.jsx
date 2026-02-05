import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  PlusCircle, 
  XCircle, 
  Info, 
  CheckCircle, 
  Clock, 
  Users, 
  Loader2, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Zap,
  BarChart3,
  ChevronRight,
  TrendingUp,
  Cpu,
  ExternalLink,
  Trash2,
  ShieldAlert
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Admin = () => {
  const { user: authUser } = useAuth();
  const isPasscodeAdmin = sessionStorage.getItem("admin_session") === "true";
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [project, setProject] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [ratings, setRatings] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getAvatar = (user) => {
    const seed = user?.avatar || user?.name || "contest.com";
    // Using big-ears-neutral for an animal-style look as requested
    return `https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear,solid`;
  };

  const loadData = async () => {
    setError("");
    try {
      const [activeResponse, participantData] = await Promise.all([
        api.getActiveProject(),
        api.participants(),
      ]);
      setProject(activeResponse.project);
      setParticipants(participantData);
      if (activeResponse.project) {
        const initial = {};
        participantData.forEach((user) => {
          initial[user._id] = ratings[user._id] || "";
        });
        setRatings(initial);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProjectChange = (event) => {
    setProjectForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {
        ...projectForm,
        startDate: new Date(projectForm.startDate).toISOString(),
        endDate: new Date(projectForm.endDate).toISOString(),
      };
      await api.createProject(payload);
      setProjectForm({ title: "", description: "", startDate: "", endDate: "" });
      setMessage("Project created successfully.");
      setTimeout(() => setMessage(""), 5000);
      loadData();
      
      window.dispatchEvent(new Event('projectUpdated'));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !window.confirm("Permanently delete this task and all its data?")) return;
    try {
      await api.deleteProject(project._id);
      setMessage("Project deleted successfully");
      loadData();
      window.dispatchEvent(new Event('projectUpdated'));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRatingChange = (userId, value) => {
    setRatings((prev) => ({ ...prev, [userId]: value }));
  };

  const handleCloseProject = async () => {
    if (!project) return;
    setMessage("");
    setError("");
    try {
      const ratingPayload = Object.entries(ratings)
        .filter(([, stars]) => stars)
        .map(([userId, stars]) => ({ userId, stars: Number(stars) }));
      await api.closeProject(project._id, { ratings: ratingPayload });
      setMessage("Project closed and ratings submitted successfully.");
      setTimeout(() => setMessage(""), 5000);
      loadData();
      window.dispatchEvent(new Event('projectUpdated'));
    } catch (err) {
      setError(err.message);
    }
  };

  const canClose = useMemo(() => {
    if (!project) return false;
    return new Date(project.endDate) <= new Date();
  }, [project]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-emerald-500/20" />
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="max-w-7xl mx-auto space-y-8 pb-32"
    >
      {/* Dynamic System Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-zinc-900/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              contest.com
            </h1>
            {authUser?.role === 'admin' && (
              <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="h-3 w-3" /> System Admin Identified
              </div>
            )}
          </div>
          <p className="text-zinc-400 font-medium">Global mission control for the competitive landscape.</p>
        </div>

        <div className="flex flex-wrap gap-4 relative z-10">
          <AnimatePresence mode="wait">
            {(message || error) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-md shadow-2xl ${
                  error 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}
              >
                {error ? <AlertTriangle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                <span className="text-xs font-black uppercase tracking-widest">{error || message}</span>
                <button onClick={() => { setError(""); setMessage(""); }}>
                  <XCircle className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Link 
            to="/admin/advanced" 
            className="flex items-center gap-3 px-6 py-3 bg-white text-zinc-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            <Cpu className="h-4 w-4" /> Advanced Controls
          </Link>
        </div>
      </motion.div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="card bg-zinc-900/20 border-white/5 p-6 flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Warriors</p>
            <p className="text-3xl font-black text-white">{participants.length}</p>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="card bg-zinc-900/20 border-white/5 p-6 flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Zap className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</p>
            <p className="text-xl font-black text-white uppercase tracking-tighter">
              {project ? 'Active Project' : 'Ready to start'}
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="card bg-zinc-900/20 border-white/5 p-6 flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Efficiency</p>
            <p className="text-3xl font-black text-white">98%</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Forms */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div variants={item} className="card p-0 overflow-hidden border-emerald-500/20">
            <div className="bg-emerald-500/5 p-6 border-b border-emerald-500/10 flex items-center gap-3">
              <PlusCircle className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">Initiate Arena Phase</h2>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Phase Designation</label>
                <input
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold placeholder:text-zinc-700"
                  name="title"
                  placeholder="CODE_CHALLENGE_26"
                  value={projectForm.title}
                  onChange={handleProjectChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Mission Brief</label>
                <textarea
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-700 min-h-[120px] resize-none"
                  name="description"
                  placeholder="Detail the operational requirements..."
                  value={projectForm.description}
                  onChange={handleProjectChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Deployment</label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-xs uppercase"
                    name="startDate"
                    type="datetime-local"
                    value={projectForm.startDate}
                    onChange={handleProjectChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Termination</label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-xs uppercase"
                    name="endDate"
                    type="datetime-local"
                    value={projectForm.endDate}
                    onChange={handleProjectChange}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!!project}
                className={`w-full py-5 rounded-3xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                  project 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 active:scale-95 hover:translate-y-[-2px]'
                }`}
              >
                <TrendingUp className="h-4 w-4" /> Launch Wave
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right Column - Active Controls */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div variants={item} className="card p-0 overflow-hidden border-white/5">
            <div className="bg-white/[0.02] p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-black text-white uppercase tracking-tighter">Wave Status</h2>
              </div>
              {project && (
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                  Phase 1.0 Running
                </div>
              )}
            </div>

            <div className="p-8 min-h-[500px] flex flex-col">
              {!project ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="h-24 w-24 rounded-full bg-zinc-950 border-2 border-dashed border-zinc-800 flex items-center justify-center mb-6">
                    <Info className="h-8 w-8 text-zinc-700" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-300 uppercase tracking-tighter">No Active Wave Detected</h3>
                  <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto">The arena is in idle state. Deploy a new challenge to begin tracking.</p>
                </div>
              ) : (
                <div className="space-y-10 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Designation</p>
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter italic">{project.title}</h3>
                        <button 
                          onClick={handleDeleteProject}
                          className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                          title="Delete Project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 w-full sm:w-auto">
                       <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Expiration</p>
                       <p className="text-sm font-mono text-emerald-400 font-bold">{new Date(project.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2 text-zinc-300 mb-2">
                      <div className="h-1 w-1 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Warrior Performance Tracking</span>
                    </div>

                    <div className="max-h-[340px] overflow-y-auto pr-4 custom-scrollbar">
                      <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-zinc-600 uppercase tracking-widest sticky top-0 bg-zinc-900/95 py-4 backdrop-blur-md z-10">
                          <tr>
                            <th className="pb-4">Operator</th>
                            <th className="pb-4 text-right">Rating Index</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {participants.map((user) => (
                            <tr key={user._id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="py-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-800 overflow-hidden border border-white/5 shadow-inner">
                                      <img src={getAvatar(user)} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase text-sm">{user.name}</p>
                                      {user.role === 'admin' && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-black uppercase tracking-tighter">ADMIN</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-[9px] text-zinc-500 font-medium tracking-wide">{user.email}</p>
                                      {project?.submissions?.find(s => String(s.user) === String(user._id)) && (
                                        <>
                                          <div className="h-1 w-1 rounded-full bg-zinc-700" />
                                          <a 
                                            href={project.submissions.find(s => String(s.user) === String(user._id)).githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] text-emerald-400 font-black hover:underline uppercase flex items-center gap-1"
                                          >
                                            View Code <ExternalLink className="h-2 w-2" />
                                          </a>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-right">
                                <div className="inline-flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-1 pr-3 shadow-inner group-focus-within:border-emerald-500/30 transition-all">
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    placeholder="0"
                                    className="w-12 bg-transparent border-none py-1 text-center font-black text-emerald-400 focus:outline-none text-lg"
                                    value={ratings[user._id] || ""}
                                    onChange={(e) => handleRatingChange(user._id, e.target.value)}
                                  />
                                  <div className="h-4 w-[1px] bg-zinc-800" />
                                  <span className="text-[10px] font-black text-zinc-600 uppercase">/ 10</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pt-8 mt-auto flex flex-col sm:flex-row items-center justify-between border-t border-white/10 gap-6">
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Termination Status</p>
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        {canClose ? (
                          <span className="text-emerald-400 text-xs font-bold uppercase flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5" /> Finalization window open
                          </span>
                        ) : (
                          <span className="text-amber-500 text-xs font-bold uppercase flex items-center gap-1.5 opacity-80">
                            <Clock className="h-3.5 w-3.5" /> Locked until deadline
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleCloseProject}
                      disabled={!canClose}
                      className={`w-full sm:w-auto px-8 py-4 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${
                        canClose 
                          ? 'bg-red-600 text-white hover:bg-red-500 hover:shadow-2xl hover:shadow-red-600/20 active:scale-95' 
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 rotate-180" /> Execute Closure
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Admin;
