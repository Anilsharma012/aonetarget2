import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../src/services/apiClient';

interface Settings {
  paymentGateway: string;
  systemStatus: string;
  maintenanceMode: boolean;
  razorpayKeyId?: string;
  contactEmail?: string;
  supportPhone?: string;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const SettingsComponent: React.FC<Props> = ({ showToast }) => {
  const [settings, setSettings] = useState<Settings>({
    paymentGateway: 'razorpay',
    systemStatus: 'online',
    maintenanceMode: false,
    razorpayKeyId: '',
    contactEmail: '',
    supportPhone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsAPI.get();
      setSettings({ ...settings, ...data });
    } catch (error) {
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      showToast('Settings updated successfully!');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 animate-fade-in max-w-3xl">
      <h3 className="text-xl font-black text-navy uppercase tracking-widest mb-10">Global Configuration</h3>
      
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Gateway</p>
            <select
              value={settings.paymentGateway}
              onChange={(e) => setSettings({ ...settings, paymentGateway: e.target.value })}
              className="w-full h-12 bg-gray-50 rounded-xl px-4 font-bold text-xs border border-gray-100 outline-none"
            >
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="paytm">Paytm</option>
            </select>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Status</p>
            <div className={`h-12 rounded-xl flex items-center px-4 font-black text-xs uppercase ${
              settings.systemStatus === 'online' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {settings.systemStatus}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Razorpay Key ID</p>
          <input
            type="text"
            value={settings.razorpayKeyId || ''}
            onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
            placeholder="rzp_live_xxxxxxxxxxxxx"
            className="w-full h-12 bg-gray-50 rounded-xl px-4 font-bold text-xs border border-gray-100 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Email</p>
            <input
              type="email"
              value={settings.contactEmail || ''}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              placeholder="support@institute.com"
              className="w-full h-12 bg-gray-50 rounded-xl px-4 font-bold text-xs border border-gray-100 outline-none"
            />
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Support Phone</p>
            <input
              type="text"
              value={settings.supportPhone || ''}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              placeholder="+91 XXXXX XXXXX"
              className="w-full h-12 bg-gray-50 rounded-xl px-4 font-bold text-xs border border-gray-100 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-xs font-black text-navy uppercase">Maintenance Mode</p>
            <p className="text-[10px] text-gray-400 mt-1">Enable to show maintenance page to users</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy"></div>
          </label>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="mt-8 bg-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default SettingsComponent;
