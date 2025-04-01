import { atom } from "jotai";

// Retrieve user from localStorage on initialization
const storedUser = JSON.parse(localStorage.getItem("user")) || null;
export const userAtom = atom(storedUser);

// Atom to update user and persist it in localStorage
export const setUserAtom = atom(
  null,
  (get, set, newUser) => {
    set(userAtom, newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  }
);

export const isSignupAtom = atom(false);
