import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiLoader } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Auto-generate slug from name
const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCategories();
      setCategories(res.data || []);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setName(''); setSlug(''); setDescription(''); setImageFile(null); setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setName(cat.name); setSlug(cat.slug); setDescription(cat.description || '');
    setImageFile(null); setImagePreview(cat.image || '');
    setShowForm(true);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editTarget) setSlug(toSlug(val));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('slug', slug.trim());
      formData.append('description', description.trim());
      if (imageFile) formData.append('image', imageFile);

      if (editTarget) {
        await adminAPI.updateCategory(editTarget._id, formData);
        toast.success('Category updated');
      } else {
        await adminAPI.createCategory(formData);
        toast.success('Category created');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally { setSaving(false); }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteCategory(cat._id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) { toast.error(err.message || 'Failed to delete'); }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-forest">Categories</h1>
          <p className="text-sm text-olive font-body mt-1">Manage product categories</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors"
        >
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg premium-shadow"
            >
              <h2 className="font-heading text-xl font-bold text-forest mb-5">
                {editTarget ? 'Edit Category' : 'Add Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-body font-semibold text-forest mb-1.5 block">Name *</label>
                  <input
                    value={name} onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none"
                    placeholder="e.g. Pickles"
                  />
                </div>
                <div>
                  <label className="text-xs font-body font-semibold text-forest mb-1.5 block">Slug *</label>
                  <div className="flex gap-2">
                    <input
                      value={slug} onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none"
                      placeholder="e.g. pickles"
                    />
                    <button type="button" onClick={() => setSlug(toSlug(name))} className="px-4 py-3 rounded-xl border border-gold/20 text-xs font-body text-forest hover:bg-cream-dark transition-colors whitespace-nowrap">
                      Auto Generate
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-body font-semibold text-forest mb-1.5 block">Description</label>
                  <textarea
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none resize-none"
                    placeholder="Brief description of this category..."
                  />
                </div>
                <div>
                  <label className="text-xs font-body font-semibold text-forest mb-1.5 block">Image</label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-gold/20" />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gold/30 text-sm font-body text-forest/60 cursor-pointer hover:border-gold transition-colors">
                      <FiImage size={16} /> {imageFile ? imageFile.name : 'Choose image'}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gold/20 text-forest font-body text-sm font-semibold hover:border-gold transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving && <FiLoader size={14} className="animate-spin" />}
                    {saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-16 bg-cream rounded-xl animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <FiImage size={40} className="mx-auto text-forest/20 mb-4" />
          <p className="font-heading text-xl text-forest/30">No categories yet</p>
          <p className="text-sm text-olive font-body mt-1">Click "Add Category" to create your first one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl premium-shadow gold-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10 bg-cream/50">
                  <th className="text-left text-xs font-body font-semibold text-forest/60 px-6 py-3">Image</th>
                  <th className="text-left text-xs font-body font-semibold text-forest/60 px-6 py-3">Name</th>
                  <th className="text-left text-xs font-body font-semibold text-forest/60 px-6 py-3">Slug</th>
                  <th className="text-left text-xs font-body font-semibold text-forest/60 px-6 py-3">Description</th>
                  <th className="text-right text-xs font-body font-semibold text-forest/60 px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={cat.image || 'https://placehold.co/64x64/1E2B24/C9A66B?text=?'}
                        alt={cat.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gold/10"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-body font-semibold text-forest">{cat.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-cream px-2 py-1 rounded-lg text-olive">{cat.slug}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs font-body text-forest/60 line-clamp-2">{cat.description || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(cat)} className="p-2 rounded-lg text-forest/50 hover:text-forest hover:bg-cream transition-colors">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(cat)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
