import React from "react";
import { useThemeStore } from "../../store/themeStore";

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { theme } = useThemeStore();

  return (
    <img
      src={
        theme === "light"
          ? "/black_circle_360x360.png"
          : "/white_circle_360x360.png"
      }
      alt="TaskMind Logo"
      className={`h-8 w-8 ${className}`}
    />
  );
};

export default Logo;
