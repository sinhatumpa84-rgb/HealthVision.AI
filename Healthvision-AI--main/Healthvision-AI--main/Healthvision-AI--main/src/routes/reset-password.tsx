import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ArrowRight, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/firebase/config";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFriendlyErrorMessage } from "@/firebase/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — HealthVision AI" },
      { name: "description", content: "Set a new password for your HealthVision AI account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");

  // Form states
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("oobCode");
      if (code) {
        setOobCode(code);
        verifyPasswordResetCode(auth, code)
          .then((email) => {
            setAccountEmail(email);
            setCodeVerified(true);
          })
          .catch((err) => {
            setErrorMessage(getFriendlyErrorMessage(err));
          });
      }
    }
  }, []);

  // Handle setting a new password with the oobCode
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!oobCode) {
      setErrorMessage("Invalid or missing password reset code.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setResetSuccess(true);
      toast.success("Password reset successful!", {
        description: "You can now sign in with your new password.",
      });
      setTimeout(() => {
        navigate({ to: "/signin", replace: true });
      }, 2500);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setErrorMessage(msg);
      toast.error("Password reset failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  // Handle requesting a new reset link
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailInput.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, emailInput.trim());
      setRequestSent(true);
      toast.success("Reset email sent", {
        description: `We've sent a password reset link to ${emailInput.trim()}.`,
      });
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setErrorMessage(msg);
      toast.error("Could not send email", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-card/20 to-background">
      <div className="text-center mb-8 max-w-sm">
        <Link to="/" className="inline-block transition-transform hover:scale-105">
          <Logo size="lg" />
        </Link>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {codeVerified ? "Set New Password" : "Reset Your Password"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {codeVerified
            ? `Setting new password for ${accountEmail}`
            : "Enter your email to receive recovery instructions"}
        </p>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 bg-card/80 backdrop-blur-xl border-border/80 shadow-xl rounded-2xl">
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5"
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {resetSuccess ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">Password Changed!</h2>
            <p className="text-sm text-muted-foreground">
              Your password has been reset successfully. Redirecting you to sign in...
            </p>
            <Link to="/signin">
              <Button className="mt-4 w-full bg-gradient-brand text-primary-foreground">
                Sign In Now
              </Button>
            </Link>
          </div>
        ) : codeVerified ? (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">New Password</Label>
              <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-input bg-input/40 px-3.5 h-11 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="border-0 bg-transparent p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/60 h-auto"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Confirm New Password</Label>
              <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-input bg-input/40 px-3.5 h-11 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="border-0 bg-transparent p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/60 h-auto"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-gradient-brand text-primary-foreground font-semibold hover:opacity-95 shadow-glow"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Update Password <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        ) : requestSent ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h2 className="text-base font-semibold text-foreground">Check Your Email</h2>
            <p className="text-sm text-muted-foreground">
              We sent password reset instructions to{" "}
              <strong className="text-foreground">{emailInput}</strong>.
            </p>
            <div className="pt-3">
              <Link to="/signin">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendLink} className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Email</Label>
              <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-input bg-input/40 px-3.5 h-11 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={loading}
                  className="border-0 bg-transparent p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/60 h-auto"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-gradient-brand text-primary-foreground font-semibold hover:opacity-95 shadow-glow"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending link...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Send Reset Link <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
