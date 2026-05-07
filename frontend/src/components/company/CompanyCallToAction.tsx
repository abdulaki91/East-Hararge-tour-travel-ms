import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, EyeIcon } from "@heroicons/react/24/outline";
import Button from "../ui/Button";

const CompanyCallToAction: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 border border-primary-200">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 font-display">
          Ready to grow your business?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Create compelling tour packages and reach more customers in East
          Hararghe region. Our platform helps you showcase the beauty of
          Ethiopian tourism.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/company/packages/create")}
            className="shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Package
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/company/packages")}
            className="shadow-lg hover:shadow-xl"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Manage Packages
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyCallToAction;
