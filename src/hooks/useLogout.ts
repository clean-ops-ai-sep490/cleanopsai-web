import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useLogout() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect even if logout fails
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return {
    isLoggingOut,
    showLogoutDialog,
    setShowLogoutDialog,
    handleLogoutClick,
    handleLogoutConfirm,
    handleLogoutCancel,
  };
}
