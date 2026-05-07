import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CogIcon,
  ServerIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { adminService, type SystemSettings } from "../../services/admin";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: adminService.getSettings,
  });

  const [settings, setSettings] = useState<Partial<SystemSettings>>({});

  React.useEffect(() => {
    if (data?.data) {
      setSettings(data.data);
    }
  }, [data]);

  const updateSettingsMutation = useMutation({
    mutationFn: adminService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setHasChanges(false);
      toast.success("Settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleReset = () => {
    if (data?.data) {
      setSettings(data.data);
      setHasChanges(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: CogIcon },
    { id: "system", name: "System", icon: ServerIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
    { id: "content", name: "Content", icon: DocumentTextIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <p className="text-error-600 mb-6 font-medium">
          Failed to load settings
        </p>
        <Button onClick={() => navigate(0)}>Try Again</Button>
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
            System Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure system-wide settings and preferences
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
                onClick={handleSave}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending
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
            {activeTab === "general" && (
              <GeneralSettings
                settings={settings}
                onChange={handleSettingChange}
              />
            )}
            {activeTab === "system" && (
              <SystemSettings
                settings={settings}
                onChange={handleSettingChange}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationSettings
                settings={settings}
                onChange={handleSettingChange}
              />
            )}
            {activeTab === "security" && (
              <SecuritySettings
                settings={settings}
                onChange={handleSettingChange}
              />
            )}
            {activeTab === "content" && (
              <ContentSettings
                settings={settings}
                onChange={handleSettingChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// General Settings Component
interface SettingsProps {
  settings: Partial<SystemSettings>;
  onChange: (key: keyof SystemSettings, value: any) => void;
}

const GeneralSettings: React.FC<SettingsProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        General Settings
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <Input
            type="text"
            value={settings.site_name || ""}
            onChange={(e) => onChange("site_name", e.target.value)}
            placeholder="Your Travel Site"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email
          </label>
          <Input
            type="email"
            value={settings.contact_email || ""}
            onChange={(e) => onChange("contact_email", e.target.value)}
            placeholder="contact@yoursite.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Phone
          </label>
          <Input
            type="tel"
            value={settings.contact_phone || ""}
            onChange={(e) => onChange("contact_phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.site_description || ""}
          onChange={(e) => onChange("site_description", e.target.value)}
          placeholder="Brief description of your travel booking platform"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  </div>
);

const SystemSettings: React.FC<SettingsProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        System Settings
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
            <p className="text-sm text-gray-600">
              Enable maintenance mode to prevent user access during updates
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenance_mode || false}
              onChange={(e) => onChange("maintenance_mode", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">User Registration</h4>
            <p className="text-sm text-gray-600">
              Allow new users to register on the platform
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.registration_enabled || false}
              onChange={(e) =>
                onChange("registration_enabled", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Booking System</h4>
            <p className="text-sm text-gray-600">
              Allow users to create new bookings
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.booking_enabled || false}
              onChange={(e) => onChange("booking_enabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Payment Processing</h4>
            <p className="text-sm text-gray-600">
              Enable payment processing for bookings
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.payment_enabled || false}
              onChange={(e) => onChange("payment_enabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>
    </div>
  </div>
);

const NotificationSettings: React.FC<SettingsProps> = ({
  settings,
  onChange,
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Notification Settings
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-600">
              Enable email notifications for users
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email_notifications || false}
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
            <h4 className="font-medium text-gray-900">SMS Notifications</h4>
            <p className="text-sm text-gray-600">
              Enable SMS notifications for users
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sms_notifications || false}
              onChange={(e) => onChange("sms_notifications", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Push Notifications</h4>
            <p className="text-sm text-gray-600">
              Enable push notifications for users
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.push_notifications || false}
              onChange={(e) => onChange("push_notifications", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>
    </div>
  </div>
);

const SecuritySettings: React.FC<SettingsProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Security Settings
      </h3>

      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />
          <p className="text-sm text-warning-800">
            Security settings changes may affect user access. Please review
            carefully before saving.
          </p>
        </div>
      </div>

      <div className="text-center py-8">
        <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h4 className="mt-2 text-lg font-medium text-gray-900">
          Security Settings
        </h4>
        <p className="mt-1 text-sm text-gray-500">
          Advanced security settings will be available in a future update.
        </p>
      </div>
    </div>
  </div>
);

const ContentSettings: React.FC<SettingsProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Content Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Upload Size (MB)
          </label>
          <Input
            type="number"
            value={settings.max_upload_size || 10}
            onChange={(e) =>
              onChange("max_upload_size", parseInt(e.target.value))
            }
            min="1"
            max="100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum file size for uploads (1-100 MB)
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allowed File Types
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "txt"].map(
            (type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.allowed_file_types?.includes(type) || false}
                  onChange={(e) => {
                    const current = settings.allowed_file_types || [];
                    if (e.target.checked) {
                      onChange("allowed_file_types", [...current, type]);
                    } else {
                      onChange(
                        "allowed_file_types",
                        current.filter((t) => t !== type),
                      );
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 uppercase">{type}</span>
              </label>
            ),
          )}
        </div>
      </div>
    </div>
  </div>
);

export default AdminSettings;
