import { atom } from "jotai";

export const userAtom = atom(null);  // Stores authenticated user info
export const isSignupAtom = atom(false);  // Tracks login/signup toggle
