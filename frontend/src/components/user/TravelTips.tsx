import React from "react";
import { FireIcon } from "@heroicons/react/24/outline";

const TravelTips: React.FC = () => {
  const tips = [
    {
      icon: "🎒",
      title: "Pack Smart",
      description:
        "Check weather conditions and pack accordingly. Don't forget essentials like sunscreen!",
    },
    {
      icon: "💡",
      title: "Book Early",
      description:
        "Get better deals and ensure availability by booking your tours in advance.",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-accent-500 to-secondary-500 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-center mb-6">
        <FireIcon className="h-8 w-8 mr-3" />
        <h2 className="text-2xl font-bold font-display">Travel Tips</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors duration-300"
          >
            <h3 className="font-semibold mb-2 flex items-center">
              <span className="text-xl mr-2">{tip.icon}</span>
              {tip.title}
            </h3>
            <p className="text-sm text-accent-100">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelTips;
