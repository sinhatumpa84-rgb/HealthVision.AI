import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n";
import { useTheme } from "@/contexts/theme";
import { useAuth, getUserInitials } from "@/contexts/auth";
import { Moon, Sun, Languages, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out", {
        description: "You have been signed out of HealthVision AI.",
      });
      navigate({ to: "/signin", replace: true });
    } catch {
      toast.error("Error signing out. Please try again.");
    }
  };

  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/symptom-checker", label: t("nav.symptoms") },
    { to: "/medical-analysis", label: t("nav.analysis") },
    { to: "/scans", label: t("nav.scans") },
    { to: "/vitals", label: t("nav.vitals") },
    { to: "/consult", label: t("nav.consult") },
    { to: "/chatbot", label: t("nav.chat") },
    { to: "/emergency", label: "Emergency" },
    { to: "/nearby", label: "Nearby" },
    { to: "/dashboard", label: t("nav.dashboard") },
  ] as const;

  const initials = getUserInitials(user?.displayName, user?.email);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Language">
                <Languages className="h-4 w-4" />
                <span className="ml-1 text-xs font-semibold uppercase">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("bn")}>বাংলা (Bengali)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User auth state */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full ring-offset-background transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:opacity-90 cursor-pointer"
                  aria-label="User profile menu"
                >
                  <Avatar className="h-9 w-9 border border-border shadow-sm">
                    {user.photoURL && (
                      <AvatarImage src={user.photoURL} alt={user.displayName || "User avatar"} />
                    )}
                    <AvatarFallback className="bg-gradient-brand text-primary-foreground font-semibold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg border-border">
                <DropdownMenuLabel className="font-normal px-2 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.displayName || (user.role === "doctor" ? "Doctor" : "Patient")}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <span className="inline-block mt-1 self-start text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {user.role === "doctor"
                        ? `Doctor ${user.specialty ? `• ${user.specialty}` : ""}`
                        : "Patient"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer py-2">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer py-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("nav.signout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/signin">
              <Button size="sm" className="bg-gradient-brand text-primary-foreground font-medium hover:opacity-90 shadow-sm">
                {t("nav.signin")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
