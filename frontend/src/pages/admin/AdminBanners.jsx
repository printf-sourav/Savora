import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiTrash2, FiX, FiAlertCircle, FiCheckCircle, FiImage } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { title: '', subtitle: '', ctaText: 'Shop Now', ctaLink: '/shop', isActive: false };

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try { setLoading(true); const r = await adminAPI.getBanners(); setBanners(r.data || []); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { toast.error('Please select a banner image'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      fd.append('title', formData.title);
      fd.append('subtitle', formData.subtitle);
      fd.append('ctaText', formData.ctaText);
      fd.append('ctaLink', formData.ctaLink);
      fd.append('isActive', formData.isActive);
      await adminAPI.createBanner(fd);
      toast.success('Banner created!');
      setShowModal(false);
      setImageFile(null); setImagePreview('');
      setFormData(EMPTY_FORM);
      fetchBanners();
    } catch (e) { toast.error(e.message); } finally { setSubmitting(false); }
  };

  const handleActivate = async (id) => {
    try { await adminAPI.activateBanner(id); toast.success('Banner activated!'); fetchBanners(); }
    catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try { await adminAPI.deleteBanner(id); toast.success('Deleted!'); fetchBanners(); }
    catch (e) { toast.error(e.message); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  return (
    <>
      <Helmet><title>Banner Management | SAVORA Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-forest">Banners</h2>
          <p className="font-body text-sm text-olive">Manage hero section banners</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors">
          <FiPlus size={16} /> Upload Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl premium-shadow gold-border p-16 text-center">
          <FiImage size={48} className="mx-auto text-olive/30 mb-4" />
          <p className="font-body text-olive">No banners uploaded yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {banners.map(banner => (
            <div key={banner._id} className={`bg-white rounded-2xl overflow-hidden premium-shadow relative group ${banner.isActive ? 'ring-2 ring-gold' : 'border border-gold/20'}`}>
              {/* Active badge */}
              {banner.isActive && (
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-green-500 text-white text-[10px] font-body font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                  <FiCheckCircle size={10} /> Active
                </div>
              )}
              {/* Image */}
              <div className="relative h-48 bg-cream overflow-hidden">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="font-heading text-lg font-bold line-clamp-1">{banner.title}</p>
                  {banner.subtitle && <p className="font-body text-xs text-white/80 line-clamp-1">{banner.subtitle}</p>}
                </div>
              </div>
              {/* Footer */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-body text-xs text-olive">CTA: <span className="text-forest font-medium">{banner.ctaText}</span></p>
                  <p className="font-body text-xs text-olive truncate max-w-[160px]">→ {banner.ctaLink}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!banner.isActive && (
                    <button onClick={() => handleActivate(banner._id)} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg font-body text-xs font-semibold hover:bg-green-100 transition-colors">
                      Set Active
                    </button>
                  )}
                  <button onClick={() => handleDelete(banner._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg premium-shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gold/10">
              <h3 className="font-heading text-xl font-bold text-forest">Upload Banner</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-olive hover:text-forest rounded-lg hover:bg-cream"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image picker */}
              <div>
                <label className="block text-xs font-body font-medium text-forest mb-1.5">Banner Image *</label>
                <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer hover:border-gold transition-colors ${imagePreview ? 'border-gold' : 'border-gold/30'}`}
                  onClick={() => document.getElementById('bannerFile').click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                  ) : (
                    <div className="py-6">
                      <FiImage size={32} className="mx-auto text-olive/40 mb-2" />
                      <p className="font-body text-sm text-olive">Click to select image</p>
                      <p className="font-body text-xs text-olive/60">Recommended: 1920×600px</p>
                    </div>
                  )}
                  <input id="bannerFile" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-body font-medium text-forest mb-1.5">Title *</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="Bold headline..." />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-forest mb-1.5">Subtitle</label>
                <input value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="Supporting tagline..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">CTA Button Text</label>
                  <input value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">CTA Link</label>
                  <input value={formData.ctaLink} onChange={e => setFormData({...formData, ctaLink: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="accent-forest w-4 h-4" />
                <span className="font-body text-sm text-forest">Set as active banner immediately</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-gold/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl border border-gold/20 font-body text-sm text-olive hover:bg-cream">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest-light disabled:opacity-60">
                  {submitting ? 'Uploading...' : 'Upload Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminBanners;
