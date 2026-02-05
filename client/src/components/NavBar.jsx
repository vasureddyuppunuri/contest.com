import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Trophy, Layout, User as UserIcon, Settings, LogOut, ShieldCheck } from "lucide-react";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 text-sm font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
      isActive ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <p className="text-lg font-black text-white italic tracking-tighter uppercase">contest.com</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <>
              <NavLink to="/" className={linkClass} end>
                <Layout className="h-4 w-4" />
                <span className="hidden md:inline">Active Project</span>
              </NavLink>
              <NavLink to="/leaderboard" className={linkClass}>
                <Trophy className="h-4 w-4" />
                <span className="hidden md:inline">Leaderboard</span>
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                <div className="relative">
                  <UserIcon className="h-4 w-4" />
                  {(user?.role === 'admin' || sessionStorage.getItem("admin_session") === "true") && (
                    <div className="absolute -top-1.5 -right-1.5 h-2 w-2 bg-red-500 rounded-full border border-zinc-950 animate-pulse" />
                  )}
                </div>
                <span className="hidden md:inline">Profile</span>
                {(user?.role === 'admin' || sessionStorage.getItem("admin_session") === "true") && (
                  <ShieldCheck className="h-3 w-3 text-red-500 hidden lg:block" />
                )}
              </NavLink>

              <div className="ml-2 h-6 w-[1px] bg-zinc-800 hidden md:block"></div>
              <button onClick={logout} className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors px-3 py-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline text-sm font-medium">Exit</span>
              </button>
            </>
          )}
          {!user && (
            <div className="flex items-center gap-4">
              <NavLink to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Sign In
              </NavLink>
              <NavLink to="/register" className="btn-primary">
                <span className="hidden sm:inline">Join Arena</span>
                <span className="sm:hidden">Join</span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
