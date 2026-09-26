import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";

/**
 * Human-friendly error messages mapped from Firebase error codes.
 */
export function getFriendlyErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const code = typeof error === "string" ? error : error?.code || "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "The email or password is incorrect.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/cancelled-popup-request":
      return "Google sign-in popup was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup. Please enable popups for this site and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a moment and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/operation-not-allowed":
      return "This sign-in provider is not enabled in Firebase Console. Please enable Email/Password or Google provider in your Firebase Authentication settings.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email address using a different sign-in method.";
    case "auth/requires-recent-login":
      return "This operation requires recent authentication. Please sign in again.";
    default:
      if (error?.message && !error.message.includes("Firebase")) {
        return error.message;
      }
      return "An error occurred during authentication. Please try again.";
  }
}

/**
 * Register a new user with full name, email, and password.
 */
export async function signUpWithEmail(
  fullName: string,
  email: string,
  password: string,
  extraMeta?: { role?: "patient" | "doctor"; specialty?: string }
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  
  if (fullName.trim()) {
    await updateProfile(credential.user, {
      displayName: fullName.trim(),
    });
  }

  // Persist role/specialty preference
  if (extraMeta && typeof window !== "undefined") {
    try {
      localStorage.setItem(
        `healthvision_user_meta_${credential.user.uid}`,
        JSON.stringify({
          role: extraMeta.role || "patient",
          specialty: extraMeta.specialty || null,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }

  return credential;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * Sign in or sign up with Google popup.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return await signInWithPopup(auth, provider);
}

/**
 * Sign out current authenticated user.
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Send password reset email.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Subscribe to authentication state changes.
 */
export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type { User };
