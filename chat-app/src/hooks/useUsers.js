import useSWR from "swr";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/config";

// Fetcher function to get users from Firestore
const fetchUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => doc.data());
};

// Custom SWR Hook to fetch users
const useUsers = () => {
  const { data, error } = useSWR("users", fetchUsers);

  return {
    users: data || [],
    isLoading: !data && !error,
    error,
  };
};

export default useUsers;
