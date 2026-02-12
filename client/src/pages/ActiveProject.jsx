import { useEffect, useState } from "react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Info, Award, Loader2, Sparkles, User, Star, Ghost, MessageCircle, Send, ExternalLink, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ActiveProject = () => {
  const { user: authUser } = useAuth();
  const [data, setData] = useState({ project: null, latestWinner: null });
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [votingFor, setVotingFor] = useState(null); // id of user being voted for
  const [voteForm, setVoteForm] = useState({ rating: 10, comment: "" });
  const [isCasting, setIsCasting] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!data.project) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(data.project.endDate);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("COMPLETED");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}D ${hours}H ${minutes}M`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [data.project]);

  useEffect(() => {
    if (votingFor) {
      setHasReviewed(false);
      setVoteForm({ rating: 10, comment: "" });
    }
  }, [votingFor]);

  const getAvatar = (user) => {
    const seed = user?.avatar || user?.name || "contest.com";
    // Using big-ears-neutral for a cute, animal-like vibe as requested
    return `https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear,solid`;
  };

  const fetchData = async () => {
    try {
      const [response, participantList] = await Promise.all([
        api.getActiveProject(),
        api.participants()
      ]);
      setData(response);
      // Ensure we compare IDs correctly as strings
      setParticipants(participantList.filter(p => {
        const pId = p._id || p.id;
        const uId = authUser?.id || authUser?._id;
        return pId && uId && String(pId) !== String(uId);
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for updates from admin/advanced admin
    window.addEventListener('projectUpdated', fetchData);
    return () => window.removeEventListener('projectUpdated', fetchData);
  }, [authUser]);

  const handleCastVote = async (e) => {
    e.preventDefault();
    if (!data.project) return;
    setIsCasting(true);
    try {
      await api.voteProject(data.project._id, {
        candidateId: votingFor,
        rating: Number(voteForm.rating),
        comment: voteForm.comment
      });
      setVotingFor(null);
      setVoteForm({ rating: 10, comment: "" });
      fetchData(); // Refresh to update visuals (though peerVotes are hidden from users usually)
    } catch (err) {
      alert(err.message);
    } finally {
      setIsCasting(false);
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!data.project || !githubUrl) return;
    setIsSubmitting(true);
    try {
      await api.submitProject(data.project._id, { githubUrl });
      alert("Project submitted successfully!");
      setGithubUrl("");
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const { project, latestWinner } = data;

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            {project && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-400 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                ACTIVE CHALLENGE
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
            contest.com
          </h1>
        </div>
        {latestWinner && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reigning Champ</p>
              <p className="text-lg font-bold text-white">{latestWinner.winner?.name}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Project Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 space-y-8"
        >
          <div className="card h-full group relative overflow-hidden flex flex-col justify-center min-h-[400px]">
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[1.7] transition-transform duration-700 pointer-events-none">
              <Sparkles className="h-64 w-64 text-emerald-500" />
            </div>

            {!project ? (
              <div className="py-20 text-center space-y-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900 text-zinc-700">
                  <Ghost className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-400 italic">The Arena is silent...</h2>
                <p className="text-zinc-600 max-w-sm mx-auto">Waiting for the next challenge to begin. Prepare your tools.</p>
              </div>
            ) : (
              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-white leading-tight underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                    {project.title}
                  </h2>
                  <p className="text-xl text-zinc-400 leading-relaxed font-medium">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-6">
                  <div className="px-6 py-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-4 transition-colors hover:border-emerald-500/30">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Clock className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Time Remaining</p>
                      <p className="text-lg font-bold text-zinc-200">
                        {timeLeft || "CALCULATING..."}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-4 transition-colors hover:border-emerald-500/30">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deadline</p>
                      <p className="text-lg font-bold text-zinc-200">
                        {new Date(data.project.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Submission Form */}
                  <div className="flex-1 min-w-[300px] px-6 py-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/30 transition-all">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Project Submission</p>
                    <form onSubmit={handleSubmitProject} className="flex gap-2">
                      <div className="relative flex-1">
                        <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600" />
                        <input 
                          type="url"
                          placeholder="GitHub Repository Link"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Deploy"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Incognito Voting Panel */}
        {authUser?.role === "participant" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="card h-full bg-emerald-950/20 border-emerald-500/10 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Ghost className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Incognito Voting</h3>
                </div>
                <Info className="h-4 w-4 text-zinc-500 cursor-help" />
              </div>

              {!project ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-zinc-500 font-medium italic text-sm">Voting opens when matches begin.</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                  <p className="text-xs text-zinc-400 mb-4 px-1">Review your fellow arena participants anonymously.</p>
                  
                  {participants.length === 0 && (
                    <p className="text-center py-10 text-zinc-600 text-sm italic">You are currently the only warrior in the arena.</p>
                  )}

                  {participants.map((p) => {
                    const submission = project.submissions?.find(s => String(s.user) === String(p._id));
                    return (
                      <motion.div 
                        key={p._id}
                        whileHover={{ scale: 1.02 }}
                        className={`group rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-emerald-500/50 p-4 transition-all duration-300 ${!submission ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden group-hover:bg-emerald-500/10 transition-colors">
                              <img src={getAvatar(p)} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-200">{p.name}</p>
                              {!submission && (
                                <span className="text-[10px] text-zinc-600 font-black italic uppercase tracking-tighter">No Submission Yet</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             {submission && (
                               <a 
                                 href={submission.githubUrl} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg flex items-center gap-1.5 border border-emerald-500/20"
                               >
                                 <ExternalLink className="h-3 w-3" /> View
                               </a>
                             )}
                             <button 
                               onClick={() => submission && setVotingFor(p._id)}
                               disabled={!submission}
                               className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                                 submission 
                                   ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white" 
                                   : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                               }`}
                             >
                               VOTE
                             </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Voting Modal */}
      <AnimatePresence>
        {votingFor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-lg card bg-zinc-900 border-white/10 shadow-3xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Ghost className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Reviewing Warrior</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                        Evaluating: {participants.find(p => p._id === votingFor)?.name}
                      </p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setVotingFor(null)} className="text-zinc-500 hover:text-white transition-colors text-2xl font-black">×</button>
              </div>

              {/* Added Project Visibility Block */}
              <div className={`mb-8 p-6 rounded-2xl border transition-all duration-500 ${hasReviewed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-950/50 border-emerald-500/20 shadow-inner'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${hasReviewed ? 'text-emerald-400' : 'text-emerald-400'}`}>
                      {hasReviewed ? '✓ Review Complete' : 'Operational Link'}
                    </p>
                    <p className="text-xs text-zinc-500 font-medium">Review the submitted codebase before finalizing your index rating.</p>
                  </div>
                  <a 
                    href={project.submissions?.find(s => String(s.user) === String(votingFor))?.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasReviewed(true)}
                    className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 whitespace-nowrap ${
                      hasReviewed 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20'
                    }`}
                  >
                    {hasReviewed ? 'Re-examine' : 'View Project'} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <form onSubmit={handleCastVote} className="space-y-8">
                <div className={!hasReviewed ? "opacity-20 pointer-events-none transition-opacity" : "transition-opacity"}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Heat Rating (0 - 10)</label>
                      <span className="text-2xl font-black text-emerald-400">{voteForm.rating}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1"
                      value={voteForm.rating}
                      onChange={(e) => setVoteForm(prev => ({ ...prev, rating: e.target.value }))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-zinc-600">
                      <span>Weak</span>
                      <span>Impressive</span>
                    </div>
                  </div>

                  <div className="space-y-4 mt-8">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Anonymous Feedback</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-4 h-5 w-5 text-zinc-600" />
                      <textarea 
                        className="input-field pl-12 min-h-[120px] bg-zinc-800/50"
                        placeholder="What did you think of their work?"
                        value={voteForm.comment}
                        onChange={(e) => setVoteForm(prev => ({ ...prev, comment: e.target.value }))}
                        required={hasReviewed}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setVotingFor(null)}
                    className="flex-1 py-4 rounded-2xl border border-zinc-800 text-zinc-400 font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isCasting || !hasReviewed}
                    className={`flex-[2] py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all ${
                      hasReviewed 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-xl shadow-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {!hasReviewed ? "Visit link to unlock" : isCasting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-5 w-5" /> Cast Vote</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveProject;
