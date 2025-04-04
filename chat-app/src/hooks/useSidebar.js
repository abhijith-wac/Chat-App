import { useAtom } from "jotai";
import { useEffect } from "react";
import { selectedUserAtom, sidebarOpenAtom } from "../atoms/sidebarAtom";

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const [, setSelectedUserId] = useAtom(selectedUserAtom);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector(".sidebar");
      const toggleButton = document.querySelector(".sidebar-toggle");

      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        toggleButton &&
        !toggleButton.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  return {
    isOpen,
    toggleSidebar,
    handleUserSelect,
    closeSidebar: () => setIsOpen(false),
  };
};
