import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

// Aesthetic animal-style seeds for DiceBear
const AVATAR_SEEDS = [
  "Aiden", "Amaya", "Arthur", "Bibi", 
  "Caleb", "Daisy", "Eden", "George", 
  "Hazel", "Jack", "Jordan", "Lily",
  "Mason", "Nala", "Oliver", "Ruby"
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", avatar: AVATAR_SEEDS[0] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleAvatarSelect = (seed) => {
    setForm((prev) => ({ ...prev, avatar: seed }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="card backdrop-blur-xl border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Join the arena</h1>
            <p className="mt-2 text-sm text-zinc-400">Choose your persona and enter the competition.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Select your avatar
              </label>
              <div className="grid grid-cols-4 gap-3 p-3 bg-zinc-900/50 rounded-2xl border border-white/5">
                {AVATAR_SEEDS.map((seed) => (
                  <motion.button
                    key={seed}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAvatarSelect(seed)}
                    className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden ${
                      form.avatar === seed
                        ? "border-emerald-500 bg-emerald-500/20 ring-4 ring-emerald-500/20"
                        : "border-transparent bg-zinc-800/50 hover:bg-zinc-800"
                    }`}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear,solid`}
                      alt={seed}
                      className="w-full h-full object-cover"
                    />
                    {form.avatar === seed && (
                      <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                        <div className="bg-emerald-500 rounded-full p-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  className="input-field pl-10"
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  className="input-field pl-10"
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  className="input-field pl-10"
                  type="password"
                  name="password"
                  placeholder="Password (min 8 characters)"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-sm text-red-400 font-medium bg-red-400/10 p-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <button type="submit" className="btn-primary w-full group py-3" disabled={loading}>
              {loading ? "Creating account..." : (
                <>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already a participant?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
