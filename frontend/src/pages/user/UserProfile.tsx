import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserIcon,
  PencilIcon,
  KeyIcon,
  BellIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/users";
import type {
  UpdateProfileData,
  ChangePasswordData,
  UpdateCompanyProfileData,
  NotificationPreferences,
} from "../../types/user";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import { toast } from "react-hot-toast";

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => userService.getProfile(),
  });

  // Notification preferences
  const { data: notificationPrefs, isLoading: prefsLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => userService.getNotificationPreferences(),
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState<UpdateProfileData>({});
  const [companyForm, setCompanyForm] = useState<UpdateCompanyProfileData>({});
  const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
  });
  const [deleteForm, setDeleteForm] = useState({ password: "" });
  const [notificationForm, setNotificationForm] =
    useState<NotificationPreferences>({
      email_notifications: true,
      sms_notifications: true,
      push_notifications: true,
      booking_updates: true,
      payment_updates: true,
      promotional_offers: false,
    });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: (data: UpdateCompanyProfileData) =>
      userService.updateCompanyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setIsEditingCompany(false);
      toast.success("Company profile updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update company profile",
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => userService.changePassword(data),
    onSuccess: () => {
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast.success("Password changed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      userService.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      setShowNotificationModal(false);
      toast.success("Notification preferences updated!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update preferences",
      );
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (data: { password: string }) => userService.deleteAccount(data),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      logout();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete account");
    },
  });

  // Initialize forms when data loads
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
      });

      if (profile.role_name === "COMPANY") {
        setCompanyForm({
          company_name: profile.company_name || "",
          description: profile.company_description || "",
          address: profile.company_address || "",
        });
      }
    }
  }, [profile]);

  React.useEffect(() => {
    if (notificationPrefs) {
      setNotificationForm(notificationPrefs);
    }
  }, [notificationPrefs]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyMutation.mutate(companyForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwordForm);
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationsMutation.mutate(notificationForm);
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    deleteAccountMutation.mutate(deleteForm);
  };

  if (profileLoading || prefsLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">
              Profile Settings
            </h1>
            <p className="text-primary-100 text-lg">
              Manage your account information and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-display">
            Personal Information
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
          >
            {isEditingProfile ? (
              <>
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                value={profileForm.name || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                required
              />
              <Input
                label="Email"
                type="email"
                value={profileForm.email || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                required
              />
              <Input
                label="Phone"
                value={profileForm.phone || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
              />
            </div>
            <div className="flex space-x-4">
              <Button type="submit" loading={updateProfileMutation.isPending}>
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-gray-900 font-medium">{profile?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900 font-medium">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <p className="text-gray-900 font-medium">
                {profile?.phone || "Not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <p className="text-gray-900 font-medium capitalize">
                {profile?.role_name.toLowerCase()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Company Information (for company users) */}
      {profile?.role_name === "COMPANY" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-display flex items-center">
              <BuildingOfficeIcon className="h-6 w-6 mr-2" />
              Company Information
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingCompany(!isEditingCompany)}
            >
              {isEditingCompany ? (
                <>
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>

          {isEditingCompany ? (
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Company Name"
                  value={companyForm.company_name || ""}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      company_name: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  label="Phone"
                  value={companyForm.phone || ""}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, phone: e.target.value })
                  }
                />
              </div>
              <Input
                label="Address"
                value={companyForm.address || ""}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, address: e.target.value })
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  value={companyForm.description || ""}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Tell us about your company..."
                />
              </div>
              <div className="flex space-x-4">
                <Button type="submit" loading={updateCompanyMutation.isPending}>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingCompany(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <p className="text-gray-900 font-medium">
                  {profile?.company_name || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    profile?.company_verified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {profile?.company_verified
                    ? "Verified"
                    : "Pending Verification"}
                </span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="text-gray-900 font-medium">
                  {profile?.company_address || "Not provided"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900">
                  {profile?.company_description || "No description provided"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value,
              })
            }
            required
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            required
            minLength={6}
          />
          <div className="flex space-x-4 pt-4">
            <Button type="submit" loading={changePasswordMutation.isPending}>
              Change Password
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Notification Preferences Modal */}
      <Modal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title="Notification Preferences"
      >
        <form onSubmit={handleNotificationSubmit} className="space-y-4">
          <div className="space-y-4">
            {[
              {
                key: "email_notifications",
                label: "Email Notifications",
                description: "Receive notifications via email",
              },
              {
                key: "sms_notifications",
                label: "SMS Notifications",
                description: "Receive notifications via SMS",
              },
              {
                key: "push_notifications",
                label: "Push Notifications",
                description: "Receive browser push notifications",
              },
              {
                key: "booking_updates",
                label: "Booking Updates",
                description: "Get notified about booking status changes",
              },
              {
                key: "payment_updates",
                label: "Payment Updates",
                description: "Get notified about payment confirmations",
              },
              {
                key: "promotional_offers",
                label: "Promotional Offers",
                description: "Receive marketing and promotional content",
              },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">
                    {pref.label}
                  </label>
                  <p className="text-sm text-gray-500">{pref.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={
                    notificationForm[pref.key as keyof NotificationPreferences]
                  }
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      [pref.key]: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              loading={updateNotificationsMutation.isPending}
            >
              Save Preferences
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNotificationModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">
              Warning: This action cannot be undone
            </h4>
            <p className="text-sm text-red-700">
              Deleting your account will permanently remove all your data,
              including bookings, reviews, and personal information.
            </p>
          </div>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <Input
              label="Enter your password to confirm"
              type="password"
              value={deleteForm.password}
              onChange={(e) => setDeleteForm({ password: e.target.value })}
              required
              placeholder="Your current password"
            />
            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                loading={deleteAccountMutation.isPending}
              >
                Delete Account
              </Button>
              <Button type="button" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
