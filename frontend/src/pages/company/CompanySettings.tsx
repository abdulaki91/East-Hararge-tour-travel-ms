import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CogIcon,
  BuildingOfficeIcon,
  BellIcon,
  UserIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  userService,
  type UserProfile,
  type NotificationPreferences,
} from "../../services/users";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface CompanyProfile extends UserProfile {
  business_license?: string;
  website?: string;
  logo?: string;
  is_verified?: boolean;
  address?: string;
  description?: string;
}

interface NotificationSettings extends NotificationPreferences {
  booking_notifications?: boolean;
  payment_notifications?: boolean;
  review_notifications?: boolean;
  marketing_notifications?: boolean;
}

const CompanySettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["company-profile"],
    queryFn: userService.getProfile,
  });

  const { data: preferencesData, isLoading: preferencesLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: userService.getNotificationPreferences,
  });

  const [profileForm, setProfileForm] = useState<Partial<CompanyProfile>>({});
  const [preferencesForm, setPreferencesForm] = useState<
    Partial<NotificationSettings>
  >({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm_password: "",
  });

  React.useEffect(() => {
    if (profileData?.data) {
      setProfileForm(profileData.data);
    }
  }, [profileData]);

  React.useEffect(() => {
    if (preferencesData?.data) {
      setPreferencesForm(preferencesData.data);
    }
  }, [preferencesData]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<CompanyProfile>) =>
      userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
      setHasChanges(false);
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      userService.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      setHasChanges(false);
      toast.success("Preferences updated successfully");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(data),
    onSuccess: () => {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirm_password: "",
      });
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });

  const handleProfileChange = (key: keyof CompanyProfile, value: any) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handlePreferencesChange = (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    setPreferencesForm((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate(preferencesForm);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm_password) {
      toast.error("New passwords don't match");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleReset = () => {
    if (activeTab === "profile" && profileData?.data) {
      setProfileForm(profileData.data);
    } else if (activeTab === "notifications" && preferencesData?.data) {
      setPreferencesForm(preferencesData.data);
    }
    setHasChanges(false);
  };

  const tabs = [
    { id: "profile", name: "Company Profile", icon: BuildingOfficeIcon },
    { id: "account", name: "Account Security", icon: ShieldCheckIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "billing", name: "Billing & Payments", icon: CreditCardIcon },
  ];

  if (profileLoading || preferencesLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CogIcon className="h-7 w-7 text-primary-600" />
            Company Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your company profile and preferences
          </p>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-warning-600 text-sm">
              <ExclamationTriangleIcon className="h-4 w-4" />
              Unsaved changes
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button
                onClick={
                  activeTab === "profile"
                    ? handleSaveProfile
                    : handleSavePreferences
                }
                disabled={
                  updateProfileMutation.isPending ||
                  updatePreferencesMutation.isPending
                }
              >
                {updateProfileMutation.isPending ||
                updatePreferencesMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary-100 text-primary-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            {activeTab === "profile" && (
              <CompanyProfileSettings
                profile={profileForm}
                onChange={handleProfileChange}
              />
            )}
            {activeTab === "account" && (
              <AccountSecuritySettings
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                onChangePassword={handleChangePassword}
                isLoading={changePasswordMutation.isPending}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationSettings
                preferences={preferencesForm}
                onChange={handlePreferencesChange}
              />
            )}
            {activeTab === "billing" && <BillingSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Company Profile Settings Component
interface ProfileSettingsProps {
  profile: Partial<CompanyProfile>;
  onChange: (key: keyof CompanyProfile, value: any) => void;
}

const CompanyProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onChange,
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Company Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <Input
            type="text"
            value={profile.company_name || ""}
            onChange={(e) => onChange("company_name", e.target.value)}
            placeholder="Your Company Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business License
          </label>
          <Input
            type="text"
            value={profile.business_license || ""}
            onChange={(e) => onChange("business_license", e.target.value)}
            placeholder="License Number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <Input
            type="url"
            value={profile.website || ""}
            onChange={(e) => onChange("website", e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <Input
            type="tel"
            value={profile.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Address
        </label>
        <textarea
          value={profile.company_address || ""}
          onChange={(e) => onChange("company_address", e.target.value)}
          placeholder="Full business address"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Description
        </label>
        <textarea
          value={profile.company_description || ""}
          onChange={(e) => onChange("company_description", e.target.value)}
          placeholder="Brief description of your company and services"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>

    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Contact Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Person Name
          </label>
          <Input
            type="text"
            value={profile.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Contact person name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            type="email"
            value={profile.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="contact@company.com"
          />
        </div>
      </div>
    </div>

    {profile.company_verified && (
      <div className="bg-success-50 border border-success-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-success-600" />
          <p className="text-sm text-success-800 font-medium">
            Your company is verified
          </p>
        </div>
      </div>
    )}
  </div>
);

// Account Security Settings Component
interface SecuritySettingsProps {
  passwordForm: any;
  setPasswordForm: (form: any) => void;
  onChangePassword: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const AccountSecuritySettings: React.FC<SecuritySettingsProps> = ({
  passwordForm,
  setPasswordForm,
  onChangePassword,
  isLoading,
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Change Password
      </h3>

      <form onSubmit={onChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <Input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <Input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            minLength={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <Input
            type="password"
            value={passwordForm.confirm_password}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                confirm_password: e.target.value,
              }))
            }
            minLength={6}
            required
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Changing Password..." : "Change Password"}
        </Button>
      </form>
    </div>
  </div>
);

// Notification Settings Component
interface NotificationSettingsProps {
  preferences: Partial<NotificationSettings>;
  onChange: (key: keyof NotificationSettings, value: boolean) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  preferences,
  onChange,
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Notification Preferences
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-600">
              Receive notifications via email
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_notifications || false}
              onChange={(e) =>
                onChange("email_notifications", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Booking Notifications</h4>
            <p className="text-sm text-gray-600">
              Get notified about new bookings and cancellations
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.booking_notifications || false}
              onChange={(e) =>
                onChange("booking_notifications", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Payment Notifications</h4>
            <p className="text-sm text-gray-600">
              Receive updates about payments and transactions
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.payment_notifications || false}
              onChange={(e) =>
                onChange("payment_notifications", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Review Notifications</h4>
            <p className="text-sm text-gray-600">
              Get notified when customers leave reviews
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.review_notifications || false}
              onChange={(e) =>
                onChange("review_notifications", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>
    </div>
  </div>
);

// Billing Settings Component
const BillingSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Billing & Payments
      </h3>

      <div className="text-center py-8">
        <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h4 className="mt-2 text-lg font-medium text-gray-900">
          Billing Settings
        </h4>
        <p className="mt-1 text-sm text-gray-500">
          Billing and payment management features will be available soon.
        </p>
      </div>
    </div>
  </div>
);

export default CompanySettings;
