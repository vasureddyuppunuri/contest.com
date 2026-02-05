import { useEffect, useState } from "react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, Star, Flame, Loader2, Search, ArrowUpRight, TrendingUp } from "lucide-react";

const Leaderboard = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getAvatar = (user) => {
    const seed = user.avatar || user.name;
    // Using big-ears-neutral for an animal-style look as requested
    return `https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear,solid`;
  };

  const fetchData = async () => {
    try {
      const data = await api.leaderboard();
      setRows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('projectUpdated', fetchData);
    return () => window.removeEventListener('projectUpdated', fetchData);
  }, []);

  const filteredUsers = rows.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredUsers.slice(0, 3);
  const remaining = filteredUsers.slice(3);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
            contest.com
          </h1>
        </div>
        
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search warriors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-xl"
          />
        </div>
      </div>

      {/* Podium Section */}
      {filteredUsers.length >= 1 && (
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 py-20 relative">
          {/* Olympic Rings Decorative Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none flex gap-4">
             {[...Array(5)].map((_, i) => (
               <div key={i} className={`w-32 h-32 rounded-full border-8 ${['border-blue-500', 'border-yellow-500', 'border-zinc-500', 'border-green-500', 'border-red-500'][i]} ${i % 2 === 0 ? '' : 'translate-y-12'}`}></div>
             ))}
          </div>

          {/* 2nd Place - Silver */}
          {topThree[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full md:w-64 z-0"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-24 w-24 rounded-full bg-zinc-800 border-4 border-zinc-400 overflow-hidden shadow-2xl">
                    <img src={getAvatar(topThree[1])} alt={topThree[1].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-zinc-400 text-zinc-950 flex items-center justify-center font-black border-4 border-zinc-900 shadow-xl">
                    2
                  </div>
                </div>
                <div className="h-40 w-full bg-gradient-to-b from-zinc-400/20 to-zinc-900/40 rounded-t-3xl border-t border-x border-white/10 flex flex-col items-center justify-center p-6 backdrop-blur-md">
                   <h3 className="text-xl font-black text-white italic truncate w-full text-center">{topThree[1].name}</h3>
                   <div className="mt-2 bg-zinc-950/50 px-4 py-1 rounded-full border border-zinc-400/30">
                      <span className="text-sm font-black text-zinc-100">{topThree[1].totalPoints} Pts</span>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 1st Place - Gold */}
          {topThree[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full md:w-72 z-10 -mx-4 mb-0 md:mb-12"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {/* Rays Effect */}
                  <div className="absolute inset-x-[-40px] inset-y-[-40px] bg-amber-500/20 blur-[60px] rounded-full animate-pulse" />
                  <div className="h-32 w-32 rounded-full bg-zinc-800 border-8 border-amber-400 overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.3)] relative z-10">
                    <img src={getAvatar(topThree[0])} alt={topThree[0].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-14 w-14 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center text-xl font-black border-6 border-zinc-900 shadow-2xl z-20">
                    <Crown className="h-6 w-6" />
                  </div>
                </div>
                <div className="h-64 w-full bg-gradient-to-b from-amber-500/30 to-zinc-900/60 rounded-t-[40px] border-t-2 border-x-2 border-amber-500/40 flex flex-col items-center justify-start pt-12 p-6 backdrop-blur-md shadow-[0_-20px_50px_-10px_rgba(251,191,36,0.15)] relative">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-950 px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                      Olympic Champion
                   </div>
                   <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase truncate w-full text-center">{topThree[0].name}</h3>
                   <div className="mt-4 bg-zinc-950 px-8 py-3 rounded-2xl border border-amber-500/30 shadow-inner">
                      <span className="text-3xl font-black text-amber-400">{topThree[0].totalPoints}</span>
                      <span className="ml-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Points</span>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place - Bronze */}
          {topThree[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full md:w-64 z-0"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-20 w-20 rounded-full bg-zinc-800 border-4 border-amber-800 overflow-hidden shadow-2xl">
                    <img src={getAvatar(topThree[2])} alt={topThree[2].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-amber-800 text-white flex items-center justify-center font-black border-4 border-zinc-900 shadow-xl">
                    3
                  </div>
                </div>
                <div className="h-32 w-full bg-gradient-to-b from-amber-900/20 to-zinc-900/40 rounded-t-3xl border-t border-x border-white/10 flex flex-col items-center justify-center p-6 backdrop-blur-md">
                   <h3 className="text-lg font-black text-white italic truncate w-full text-center">{topThree[2].name}</h3>
                   <div className="mt-2 bg-zinc-950/50 px-4 py-1 rounded-full border border-amber-900/30">
                      <span className="text-xs font-black text-zinc-300">{topThree[2].totalPoints} Pts</span>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Rankings List */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-4">
            <div className="h-1 w-12 bg-emerald-500 rounded-full" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Global Standoff</h2>
          </div>
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5">
             {filteredUsers.length} Units Detected
          </div>
        </div>

        <div className="space-y-3">
          {remaining.length > 0 ? (
            remaining.map((user, idx) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx % 10 * 0.05 }}
                className="group relative overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/0 group-hover:bg-emerald-500 transition-all duration-300" />
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-emerald-500/20 hover:bg-zinc-900/60 transition-all cursor-default">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-12 h-12 flex items-center justify-center text-sm font-black text-zinc-600 bg-zinc-950 rounded-xl border border-white/5 group-hover:text-emerald-500 clip-path-slanted transition-colors">
                        #{user.rank}
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-zinc-800 border-2 border-zinc-800 group-hover:border-emerald-500/50 overflow-hidden transition-all shadow-lg">
                        <img src={getAvatar(user)} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-black text-base text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter">{user.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest border border-zinc-800 px-2 py-0.5 rounded">Deploy Grade B</span>
                           {user.streak >= 3 && <Flame className="h-3 w-3 text-orange-500" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-8 mt-4 md:mt-0 px-4">
                    <div className="flex items-center gap-10">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-emerald-500 font-black">
                           <span>{user.latestRating}.0</span>
                        </div>
                        <p className="text-[8px] font-black text-zinc-600 uppercase mt-1">Heat Index</p>
                      </div>
                      <div className="h-8 w-px bg-white/5 hidden sm:block" />
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-orange-500 font-black">
                           <span>{user.streak}</span>
                        </div>
                        <p className="text-[8px] font-black text-zinc-600 uppercase mt-1">Kill Streak</p>
                      </div>
                    </div>

                    <div className="bg-zinc-950 px-6 py-3 rounded-2xl border border-white/5 min-w-[120px] shadow-inner text-center">
                      <p className="text-2xl font-black text-white italic tracking-tighter">{user.totalPoints}</p>
                      <div className="flex items-center justify-center gap-2 mt-0.5">
                         <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
                         <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Aggregate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center card bg-transparent border-dashed border-white/10">
              <p className="text-zinc-500 font-medium italic">The Arena is currently empty.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
