import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSettings, FiSave, FiAlertCircle } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    announcementBarText: 'Free Shipping on orders above ₹999 | Use code SAVORA10 for 10% off',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getSiteSettings();
        const settings = response.data;
        setForm({
          announcementBarText: settings?.announcementBarText || 'Free Shipping on orders above ₹999 | Use code SAVORA10 for 10% off',
        });
      } catch (err) {
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await adminAPI.updateSiteSettings(form);
      const settings = response.data;
      setForm({
        announcementBarText: settings?.announcementBarText || '',
      });
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-olive">
        <FiAlertCircle size={48} className="mb-4 text-red-400" />
        <p className="font-body text-lg mb-2">Failed to load settings</p>
        <p className="font-body text-sm text-olive/60 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-forest text-cream rounded-xl font-body text-sm hover:bg-forest-light transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>{'Settings | SAVORA Admin'}</title></Helmet>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-forest">Platform Settings</h2>
          <p className="font-body text-sm text-olive">Manage global configuration for Savora</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors disabled:opacity-60">
          <FiSave size={16} /> Save Changes
        </button>
      </div>

      <div className="bg-white rounded-2xl premium-shadow gold-border p-6 md:p-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FiSettings size={28} className="text-gold" />
              <div>
                <h3 className="font-heading text-xl font-bold text-forest">Top Text</h3>
                <p className="font-body text-sm text-olive">Edit the text shown in the top bar across the site.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-forest mb-1.5">Top text</label>
              <textarea
                rows={4}
                value={form.announcementBarText}
                onChange={(e) => setForm((prev) => ({ ...prev, announcementBarText: e.target.value }))}
                className="block w-full px-4 py-3 border border-gold/20 rounded-xl bg-cream focus:ring-gold focus:border-gold sm:text-sm font-body outline-none"
                placeholder="Type any text you want to show in the top bar"
              />
            </div>
          </div>

          <div className="bg-forest rounded-2xl p-6 text-cream">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Preview</p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center font-body text-sm leading-6">
              <span>
                <span className="text-gold">✨</span> {form.announcementBarText} <span className="text-gold">✨</span>
              </span>
            </div>
            <p className="mt-4 text-xs text-cream/60 font-body">
              This updates the top bar across the storefront immediately after saving.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
