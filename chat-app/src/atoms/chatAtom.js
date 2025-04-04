import { atom } from "jotai";

export const usersWithUnseenMessagesAtom = atom([]);
export const userLoadingAtom = atom(true);
export const usersErrorAtom = atom(null);
export const searchQueryAtom = atom("");
export const userDetailsAtom = atom(null);
export const messagesAtom = atom([]);
export const textAtom = atom("");
export const emojiPickerAtom = atom(false);
export const optionsAtom = atom(null);
export const editingMessageAtom = atom(null);
export const editTextAtom = atom("");
export const selectedMessageAtom = atom(null);
export const typingAtom = atom(false); // Default to false
export const isOtherUserTypingAtom = atom(false); // Atom for other user's typing status
export const isSendingAtom = atom(false);







