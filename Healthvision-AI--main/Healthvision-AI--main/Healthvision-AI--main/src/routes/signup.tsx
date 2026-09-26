import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  HeartPulse,
  Stethoscope,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { signUpWithEmail, signInWithGoogle, getFriendlyErrorMessage } from "@/firebase/auth";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — HealthVision AI" },
      { name: "description", content: "Create your HealthVision AI account as a patient or doctor to access intelligent healthcare insights." },
    ],
  }),
  component: SignUpPage,
});

const SPECIALTIES = [
  "General Practitioner",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Radiology",
  "Other",
];

function SignUpPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [specialty, setSpecialty] = useState("General Practitioner");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Email format regex validation
  const isValidEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  // Password strength criteria
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[\d!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const isPasswordStrong = hasMinLength && hasNumberOrSymbol && hasLetter;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate required fields
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    // 2. Validate email format
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // 3. Require a strong password
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (!hasLetter || !hasNumberOrSymbol) {
      setErrorMessage("Password must contain at least one letter and one number or special character.");
      return;
    }

    // 4. Check password match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 5 & 6. Create Firebase account & update display name
      await signUpWithEmail(fullName, email, password, {
        role,
        specialty: role === "doctor" ? specialty : undefined,
      });

      toast.success("Account created successfully!", {
        description: `Welcome to HealthVision AI, ${fullName.trim()}!`,
      });

      // 7 & 8. Automatically authenticated -> redirect to dashboard
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      setErrorMessage(friendlyMsg);
      toast.error("Registration failed", {
        description: friendlyMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google", {
        description: "Welcome to HealthVision AI!",
      });
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setErrorMessage(friendlyMsg);
        toast.error("Google registration failed", {
          description: friendlyMsg,
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Checking credentials...</p>
        </div>
      </div>
    );
  }

  const isBusy = isSubmitting || isGoogleLoading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-card/20 to-background">
      <div className="text-center mb-8 max-w-sm">
        <Link to="/" className="inline-block transition-transform hover:scale-105">
          <Logo size="lg" />
        </Link>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Create Your Account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Join HealthVision AI for intelligent health guidance
        </p>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 bg-card/80 backdrop-blur-xl border-border/80 shadow-xl rounded-2xl">
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5 animate-in fade-in"
          >
            <span className="text-base leading-none">⚠️</span>
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <Label className="text-sm font-medium text-foreground">I am joining as a</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2.5">
              <RoleOption
                active={role === "patient"}
                icon={<HeartPulse className="h-4 w-4" />}
                label="Patient"
                onClick={() => setRole("patient")}
                disabled={isBusy}
              />
              <RoleOption
                active={role === "doctor"}
                icon={<Stethoscope className="h-4 w-4" />}
                label="Doctor"
                onClick={() => setRole("doctor")}
                disabled={isBusy}
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">
              Full Name
            </Label>
            <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-input bg-input/40 px-3.5 h-11 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                id="signup-name"
                required
                placeholder={role === "doctor" ? "Dr. Jane Doe" : "Jane Doe"}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isBusy}
                className="border-0 bg-transparent p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/60 h-auto"
              />
            </div>
          </div>

          {/* Doctor Specialty */}
          {role === "doctor" && (
            <div>
              <Label className="text-sm font-medium text-foreground">Specialty</Label>
              <Select value={specialty} onValueChange={setSpecialty} disabled={isBusy}>
                <SelectTrigger className="mt-1.5 h-11 bg-input/40 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Email */}
          <div>
            <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-input bg-input/40 px-3.5 h-11 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isBusy}
                className="border-0 bg-transparent p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/60 h-auto"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-input bg-input/40 px-3.5 h-11 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isBusy}
                className="border-0 bg-transparent p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/60 h-auto"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isBusy}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength hints */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  {hasMinLength ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={hasMinLength ? "text-emerald-400" : "text-muted-foreground"}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasLetter && hasNumberOrSymbol ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={hasLetter && hasNumberOrSymbol ? "text-emerald-400" : "text-muted-foreground"}>
                    Includes letters and numbers/symbols
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="signup-confirm" className="text-sm font-medium text-foreground">
              Confirm Password
            </Label>
            <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-input bg-input/40 px-3.5 h-11 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                id="signup-confirm"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isBusy}
                className="border-0 bg-transparent p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/60 h-auto"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={isBusy}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="mt-1 text-xs text-rose-400">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isBusy}
            className="w-full h-11 mt-2 bg-gradient-brand text-primary-foreground font-semibold hover:opacity-95 shadow-glow transition-all rounded-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Create {role === "doctor" ? "Doctor" : "Patient"} Account <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
            OR
          </span>
        </div>

        <GoogleAuthButton
          onClick={handleGoogleSignUp}
          isLoading={isGoogleLoading}
          disabled={isBusy}
          text="Continue with Google"
        />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </Card>

      <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          ← Back to home
        </Link>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" /> Powered by Firebase Auth
        </span>
      </div>
    </div>
  );
}

function RoleOption({
  active,
  icon,
  label,
  onClick,
  disabled,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 h-11 text-sm font-medium transition-all ${
        active
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "border-input bg-input/40 text-foreground hover:bg-accent/80"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {icon}
      {label}
    </button>
  );
}
