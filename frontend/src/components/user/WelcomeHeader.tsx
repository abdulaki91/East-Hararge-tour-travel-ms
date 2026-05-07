import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";

interface WelcomeHeaderProps {
  userName?: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName }) => {
  return (
    <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">
            Welcome back, {userName}! 🌟
          </h1>
          <p className="text-primary-100 text-lg">
            Ready for your next adventure?
          </p>
        </div>
        <div className="hidden md:block">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <UserIcon className="h-16 w-16 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
