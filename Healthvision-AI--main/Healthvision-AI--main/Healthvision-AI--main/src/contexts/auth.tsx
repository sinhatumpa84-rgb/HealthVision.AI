import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { type User, onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { auth } from "@/firebase/config";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface HealthVisionUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerData: any[];
  role: "patient" | "doctor";
  specialty?: string | null;
}

interface AuthContextValue {
  user: HealthVisionUser | null;
  firebaseUser: User | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const buildUser = (fUser: User): HealthVisionUser => {
    let role: "patient" | "doctor" = "patient";
    let specialty: string | null = null;

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`healthvision_user_meta_${fUser.uid}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.role === "doctor" || parsed.role === "patient") {
            role = parsed.role;
          }
          if (parsed.specialty) {
            specialty = parsed.specialty;
          }
        }
      } catch {
        // Fallback to default
      }
    }

    return {
      uid: fUser.uid,
      displayName: fUser.displayName || null,
      email: fUser.email || null,
      photoURL: fUser.photoURL || null,
      providerData: fUser.providerData || [],
      role,
      specialty,
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      if (fUser) {
        setFirebaseUser(fUser);
        setStatus("authenticated");
      } else {
        setFirebaseUser(null);
        setStatus("unauthenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  const user = useMemo(() => {
    if (!firebaseUser) return null;
    return buildUser(firebaseUser);
  }, [firebaseUser]);

  const signOut = async () => {
    await fbSignOut(auth);
    setFirebaseUser(null);
    setStatus("unauthenticated");
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setFirebaseUser(auth.currentUser);
    }
  };

  const value: AuthContextValue = {
    user,
    firebaseUser,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    signOut,
    reloadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Utility to extract user initials for avatar fallback.
 */
export function getUserInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (email && email.trim().length > 0) {
    return email.substring(0, 2).toUpperCase();
  }
  return "HV";
}
