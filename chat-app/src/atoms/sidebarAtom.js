// atoms/sidebarAtom.js
import { atom } from "jotai";

export const sidebarOpenAtom = atom(false);
export const selectedUserAtom = atom(null); // or initial user ID if needed

