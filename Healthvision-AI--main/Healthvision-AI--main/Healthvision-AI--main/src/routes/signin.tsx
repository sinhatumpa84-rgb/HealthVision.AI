import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { signInWithEmail, signInWithGoogle, sendPasswordReset, getFriendlyErrorMessage } from "@/firebase/auth";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — HealthVision AI" },
      { name: "description", content: "Sign in to access your HealthVision AI dashboard, diagnoses, and medical tools." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validation
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
      toast.success("Welcome back!", {
        description: "Successfully signed in to HealthVision AI.",
      });
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      setErrorMessage(friendlyMsg);
      toast.error("Sign in failed", {
        description: friendlyMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
      // Don't show toast error if user just cancelled the popup
      if (err?.code !== "auth/popup-closed-by-user") {
        setErrorMessage(friendlyMsg);
        toast.error("Google sign in failed", {
          description: friendlyMsg,
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address above to receive password reset instructions.");
      toast.error("Email required", {
        description: "Enter your email address to reset your password.",
      });
      return;
    }

    setErrorMessage(null);
    setIsForgotLoading(true);
    try {
      await sendPasswordReset(email);
      toast.success("Password reset email sent", {
        description: `We've sent a password reset link to ${email.trim()}.`,
      });
    } catch (err: any) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      setErrorMessage(friendlyMsg);
      toast.error("Could not send reset email", {
        description: friendlyMsg,
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Prevent flash while checking auth state
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

  const isBusy = isSubmitting || isGoogleLoading || isForgotLoading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-card/20 to-background">
      <div className="text-center mb-8 max-w-sm">
        <Link to="/" className="inline-block transition-transform hover:scale-105">
          <Logo size="lg" />
        </Link>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Continue your HealthVision journey
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
          <div>
            <Label htmlFor="signin-email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-input bg-input/40 px-3.5 h-11 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                id="signin-email"
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

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="signin-password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isBusy}
                className="text-xs text-primary hover:underline hover:text-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                {isForgotLoading ? "Sending..." : "Forgot password?"}
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-input bg-input/40 px-3.5 h-11 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
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
          </div>

          <Button
            type="submit"
            disabled={isBusy}
            className="w-full h-11 mt-2 bg-gradient-brand text-primary-foreground font-semibold hover:opacity-95 shadow-glow transition-all rounded-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Sign In <ArrowRight className="h-4 w-4" />
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
          onClick={handleGoogleSignIn}
          isLoading={isGoogleLoading}
          disabled={isBusy}
          text="Continue with Google"
        />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
          >
            Create an account
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
