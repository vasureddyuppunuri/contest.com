import { useEffect, useState } from "react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle, 
  Search, 
  Loader2, 
  CheckCircle,
  X,
  History,
  Layout,
  ShieldAlert,
  Terminal,
  Activity,
  ArrowLeft,
  Settings2
} from "lucide-react";
import { Link } from "react-router-dom";

const AdvancedAdmin = () => {
  const [participants, setParticipants] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // States for editing
  const [editingProject, setEditingProject] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(null);
  const [isDeletingProject, setIsDeletingProject] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userList, projectList] = await Promise.all([
        api.participants(),
        api.listProjects()
      ]);
      setParticipants(userList);
      setProjects(projectList);
      setSelectedUsers([]);
    } catch (err) {
      setError("Failed to fetch administrative data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to vanish ${selectedUsers.length} warriors?`)) return;
    try {
      setIsBulkDeleting(true);
      await api.bulkDeleteUsers(selectedUsers);
      setParticipants(prev => prev.filter(u => !selectedUsers.includes(u._id)));
      setSelectedUsers([]);
      showSuccess(`${selectedUsers.length} warriors vanished`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.deleteUser(userId);
      setParticipants(prev => prev.filter(u => u._id !== userId));
      setIsDeletingUser(null);
      showSuccess("Participant removed successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p._id !== projectId));
      setIsDeletingProject(null);
      showSuccess("Phase history purged");
      window.dispatchEvent(new Event('projectUpdated'));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await api.updateProject(editingProject._id, {
        title: editingProject.title,
        description: editingProject.description,
        startDate: editingProject.startDate,
        endDate: editingProject.endDate
      });
      setProjects(prev => prev.map(p => p._id === editingProject._id ? editingProject : p));
      setEditingProject(null);
      showSuccess("Project timeline updated");
      window.dispatchEvent(new Event('projectUpdated'));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers = participants.filter(u => 
    u.name.toLowerCase().includes(appliedSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(appliedSearch.toLowerCase())
  );

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(appliedSearch.toLowerCase()) ||
    p.description?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
    p.winner?.name?.toLowerCase().includes(appliedSearch.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto" />
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Accessing Cryptographic Layer...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 pt-10">
      {/* System Breadcrumb/Back */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link to="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 hover:text-emerald-400 transition-colors group">
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
          Back to Phase Management
        </Link>
      </motion.div>

      {/* Authority Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-zinc-900/60 p-8 rounded-3xl border border-white/5 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 pointer-events-none">
          <Settings2 className="h-48 w-48 text-emerald-500" />
        </div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em]">System Level 0 Authority</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Global <span className="text-emerald-500">Override</span>
          </h1>
          <p className="text-zinc-400 font-medium">Critical system maintenance and user sanitization protocols.</p>
        </div>

        <div className="flex flex-col items-end gap-4 relative z-10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setAppliedSearch(searchTerm);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input 
                type="text" 
                placeholder="SYSTEM SEARCH..." 
                className="bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-bold tracking-widest w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10"
            >
              Execute
            </button>
            {appliedSearch && (
              <button 
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setAppliedSearch("");
                }}
                className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
              >
                Reset
              </button>
            )}
          </form>

          <AnimatePresence>
            {success && (
              <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10">
                <CheckCircle className="h-4 w-4" /> {success}
              </motion.div>
            )}
            {error && (
              <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/10">
                <AlertCircle className="h-4 w-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Directory Management */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card bg-zinc-900/40 border-white/5 p-0 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">Warrior Directory</h2>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global participant registry</p>
                </div>
              </div>

              {selectedUsers.length > 0 && (
                <motion.button 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="px-6 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-500 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 flex items-center gap-2"
                >
                  {isBulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Vanish Selection ({selectedUsers.length})
                </motion.button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-[10px] uppercase font-black tracking-[0.2em] text-zinc-600 border-b border-white/5">
                  <tr>
                    <th className="px-8 py-5 w-10">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                        className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-offset-0 focus:ring-emerald-500/50"
                      />
                    </th>
                    <th className="px-8 py-5">Operator profile</th>
                    <th className="px-8 py-5">Communication</th>
                    <th className="px-8 py-5 text-center">Arena Stats</th>
                    <th className="px-8 py-5 text-right">sanitization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(user => (
                    <tr 
                      key={user._id} 
                      className={`group transition-all duration-500 ${
                        selectedUsers.includes(user._id)
                        ? 'bg-emerald-500/10'
                        : appliedSearch && (user.name.toLowerCase().includes(appliedSearch.toLowerCase()) || user.email.toLowerCase().includes(appliedSearch.toLowerCase()))
                        ? 'bg-emerald-500/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' 
                        : 'hover:bg-white/[0.01]'
                      }`}
                    >
                      <td className="px-8 py-6">
                        <input 
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-offset-0 focus:ring-emerald-500/50"
                        />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-zinc-800 border-2 border-zinc-800 group-hover:border-emerald-500/50 overflow-hidden transition-all shadow-inner">
                            <img 
                              src={`https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=${user.avatar || user.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear,solid`} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <span className={`font-black uppercase text-sm tracking-tighter italic transition-colors ${
                              appliedSearch && user.name.toLowerCase().includes(appliedSearch.toLowerCase())
                              ? 'text-emerald-400' 
                              : 'text-white group-hover:text-emerald-400'
                            }`}>
                              {user.name}
                            </span>
                            <div className="flex items-center gap-2">
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                               <span className="text-[9px] font-black text-zinc-500 tracking-widest uppercase">{user.role}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-zinc-400 font-mono text-xs lowercase">{user.email}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-tighter">
                          <div className="flex flex-col items-center">
                            <span className="text-emerald-400 leading-none">{user.totalPoints}</span>
                            <span className="text-[8px] text-zinc-600">points</span>
                          </div>
                          <div className="w-[1px] h-6 bg-zinc-800" />
                          <div className="flex flex-col items-center">
                            <span className="text-orange-400 leading-none">{user.streak}D</span>
                            <span className="text-[8px] text-zinc-600">streak</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setIsDeletingUser(user)}
                          className="px-4 py-2 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 font-black uppercase text-[10px] tracking-widest"
                        >
                          Vanish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-30">
                   <Users className="h-12 w-12 mx-auto text-zinc-700" />
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">No matching operators found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Override History & Audit */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card bg-zinc-900 border-white/5 shadow-2xl p-0 overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center gap-3">
              <History className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">Arena Audit Log</h2>
            </div>

            <div className="p-6 space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
              {filteredProjects.map(p => (
                <motion.div 
                  key={p._id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className={`p-5 rounded-2xl border transition-all duration-500 space-y-4 group ${
                    appliedSearch && (p.title.toLowerCase().includes(appliedSearch.toLowerCase()) || p.description?.toLowerCase().includes(appliedSearch.toLowerCase()))
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : 'bg-white/[0.02] border-white/5 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                       <h4 className={`font-black text-sm tracking-tight uppercase transition-colors italic ${
                         appliedSearch && p.title.toLowerCase().includes(appliedSearch.toLowerCase())
                         ? 'text-emerald-400'
                         : 'text-zinc-200 group-hover:text-emerald-400'
                       }`}>
                         {p.title}
                       </h4>
                       <div className={`text-[8px] font-black uppercase tracking-[0.2em] w-fit px-2 py-0.5 rounded border ${
                         p.status === 'active' 
                           ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                           : 'bg-zinc-900 text-zinc-600 border-white/5'
                       }`}>
                         {p.status}
                       </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingProject({...p, startDate: p.startDate.substring(0, 16), endDate: p.endDate.substring(0, 16)})}
                        className="p-2.5 rounded-xl bg-zinc-950 text-zinc-500 hover:text-white hover:bg-emerald-600 transition-all border border-white/5 shadow-lg"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setIsDeletingProject(p)}
                        className="p-2.5 rounded-xl bg-zinc-950 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5 shadow-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-zinc-600">
                       <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(p.startDate).toLocaleDateString()}</span>
                       <span className="h-0.5 w-4 bg-zinc-800" />
                       <span className="flex items-center gap-1.5">{new Date(p.endDate).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="bg-zinc-950/50 rounded-xl p-2 border border-white/5">
                        <p className="text-[7px] text-zinc-500 uppercase font-black tracking-widest">Submissions</p>
                        <p className="text-xs font-black text-emerald-500">{p.submissions?.length || 0}</p>
                      </div>
                      <div className="bg-zinc-950/50 rounded-xl p-2 border border-white/5">
                        <p className="text-[7px] text-zinc-500 uppercase font-black tracking-widest">Winner</p>
                        <p className="text-[9px] font-black text-white truncate">
                          {p.winner ? `${p.winner.name} (${p.winnerPoints}pts)` : '---'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="py-10 text-center opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No Phase History Matches</p>
                </div>
              )}
            </div>
          </div>

          <div className="card bg-emerald-600 p-8 flex flex-col items-center text-center space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            <Activity className="h-10 w-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
            <div className="space-y-1 relative z-10">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">System Pulse</h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">All protocols active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal Overlay */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="w-full max-w-2xl card bg-zinc-900 border-white/10 p-0 overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)]"
            >
              <div className="bg-white/[0.02] p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Layout className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Override Phase</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Temporal shift protocol initiated</p>
                  </div>
                </div>
                <button onClick={() => setEditingProject(null)} className="p-3 rounded-2xl bg-zinc-950 text-zinc-500 hover:text-white transition-colors">
                   <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateProject} className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Phase Identifier</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl py-5 px-6 text-white text-xl font-black italic focus:outline-none focus:border-emerald-500 transition-all uppercase" 
                    value={editingProject.title} 
                    onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Operational Instructions</label>
                  <textarea 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl py-5 px-6 text-white font-medium focus:outline-none focus:border-emerald-500 transition-all min-h-[140px] resize-none" 
                    value={editingProject.description} 
                    onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                  />
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Inception Date</label>
                  <input 
                    type="datetime-local" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl py-5 px-6 text-white font-mono text-xs focus:outline-none focus:border-emerald-500" 
                    value={editingProject.startDate} 
                    onChange={e => setEditingProject({...editingProject, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Conclusion Date</label>
                  <input 
                    type="datetime-local" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl py-5 px-6 text-white font-mono text-xs focus:outline-none focus:border-emerald-500" 
                    value={editingProject.endDate} 
                    onChange={e => setEditingProject({...editingProject, endDate: e.target.value})}
                  />
                </div>
              </div>

                <button type="submit" className="w-full py-6 rounded-[2.5rem] bg-emerald-600 text-white font-black uppercase text-sm tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/20 active:scale-95">
                  Confirm Rewrite
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Project Banish Confirmation */}
        {isDeletingProject && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-zinc-950/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full card border-red-500/30 bg-zinc-900 p-10 text-center space-y-8">
              <div className="px-6 py-6 rounded-3xl bg-red-500/10 text-red-500 w-fit mx-auto border border-red-500/20">
                <Trash2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Purge Phase?</h3>
                <p className="text-zinc-400 text-sm leading-relaxed px-4 font-medium">
                  The phase <span className="text-white font-black">{isDeletingProject.title}</span> and all associated analytical data will be erased.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsDeletingProject(null)} className="flex-1 py-4 px-6 rounded-2xl bg-zinc-950 border border-white/5 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Abort</button>
                <button onClick={() => handleDeleteProject(isDeletingProject._id)} className="flex-1 py-4 px-6 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20 active:scale-95">Erase Data</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Banish Confirmation Modal Overlay */}
        {isDeletingUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-zinc-950/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full card border-red-500/30 bg-zinc-900 p-10 text-center space-y-8">
              <div className="px-6 py-6 rounded-3xl bg-red-500/10 text-red-500 w-fit mx-auto border border-red-500/20">
                <ShieldAlert className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Vanish Warrior?</h3>
                <p className="text-zinc-400 text-sm leading-relaxed px-4 font-medium">
                  The operator <span className="text-white font-black">{isDeletingUser.name}</span> will be purged from the arena database permanently.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsDeletingUser(null)} className="flex-1 py-4 px-6 rounded-2xl bg-zinc-950 border border-white/5 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Abort</button>
                <button onClick={() => handleDeleteUser(isDeletingUser._id)} className="flex-1 py-4 px-6 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20 active:scale-95">Purge Operator</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedAdmin;