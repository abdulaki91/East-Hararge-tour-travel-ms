import React from "react";

interface PackageHeroProps {
  totalPackages: number;
}

const PackageHero: React.FC<PackageHeroProps> = ({ totalPackages }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover East Hararghe
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Explore authentic Ethiopian culture and breathtaking landscapes with
            our expertly crafted tour packages
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span>{totalPackages}+ Tours Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span>Local Expert Guides</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
              <span>Authentic Experiences</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageHero;
