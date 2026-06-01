import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/constants';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  // TASK 5: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', shortDescription: '',
    category: '', price: '', discountPrice: '', stock: '',
    shelfLife: '', featured: false, bestseller: false,
  });

  useEffect(() => { fetchProducts(currentPage); fetchCategories(); }, [currentPage]);

  const fetchProducts = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await adminAPI.getProducts({ page, limit: LIMIT });
      const payload = res.data || {};
      setProducts(payload.data || []);
      setTotal(payload.total || 0);
      setTotalPages(payload.pages || 1);
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      // Categories might not exist yet
    }
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newData = { ...formData, [name]: type === 'checkbox' ? checked : value };
    if (name === 'title' && !editingProduct) {
      newData.slug = generateSlug(value);
    }
    setFormData(newData);
  };

  const [imageFiles, setImageFiles] = useState([]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setImageFiles([]);
    setFormData({
      title: '', slug: '', description: '', shortDescription: '',
      category: categories[0]?._id || '', price: '', discountPrice: '', stock: '',
      shelfLife: '', featured: false, bestseller: false,
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setImageFiles([]);
    setFormData({
      title: product.title, slug: product.slug, description: product.description,
      shortDescription: product.shortDescription, category: product.category?._id || product.category,
      price: product.price, discountPrice: product.discountPrice || '',
      stock: product.stock, shelfLife: product.shelfLife || '',
      featured: product.featured, bestseller: product.bestseller,
    });
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      
      imageFiles.forEach(file => {
        data.append('images', file);
      });

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, data);
        toast.success('Product updated!');
      } else {
        await adminAPI.createProduct(data);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id);
      toast.success('Product deleted!');
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>{'Products Management | SAVORA Admin'}</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-forest">Products</h2>
          <p className="font-body text-sm text-olive">{products.length} products total</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-olive/50" size={16} />
            <input
              type="text" placeholder="Search products..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body text-forest focus:border-gold outline-none"
            />
          </div>
          <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors whitespace-nowrap">
            <FiPlus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl premium-shadow gold-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiAlertCircle size={48} className="mx-auto text-olive/30 mb-4" />
            <p className="font-body text-olive">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream/50 border-b border-gold/10">
                <tr>
                  <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Product</th>
                  <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Category</th>
                  <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Price</th>
                  <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Stock</th>
                  <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product._id} className="border-b border-gold/5 hover:bg-cream/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || 'https://placehold.co/48x48/1E2B24/C9A66B?text=P'}
                          alt={product.title} className="w-10 h-10 rounded-lg object-cover bg-cream"
                        />
                        <div>
                          <p className="font-body text-sm font-semibold text-forest line-clamp-1">{product.title}</p>
                          <p className="font-body text-xs text-olive/60">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-body text-sm text-olive">{product.category?.name || '—'}</td>
                    <td className="py-4 px-4">
                      <p className="font-body text-sm font-semibold text-forest">{formatPrice(product.price)}</p>
                      {product.discountPrice && (
                        <p className="font-body text-xs text-green-600">{formatPrice(product.discountPrice)}</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-body text-sm font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(product)} className="p-2 text-olive hover:text-gold rounded-lg hover:bg-gold/10 transition-colors">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-2 text-olive hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TASK 5: Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
          <p className="font-body text-sm text-olive">
            Showing {((currentPage - 1) * LIMIT) + 1}–{Math.min(currentPage * LIMIT, total)} of {total} products
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-gold/20 font-body text-sm text-forest disabled:opacity-40 hover:bg-cream transition-colors">
              ← Prev
            </button>
            <span className="font-body text-sm text-forest px-3">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-gold/20 font-body text-sm text-forest disabled:opacity-40 hover:bg-cream transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto premium-shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gold/10">
              <h3 className="font-heading text-xl font-bold text-forest">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-olive hover:text-forest rounded-lg hover:bg-cream transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Title *</label>
                  <input name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Slug *</label>
                  <input name="slug" value={formData.slug} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-body font-medium text-forest mb-1.5">Short Description *</label>
                <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
              </div>

              <div>
                <label className="block text-xs font-body font-medium text-forest mb-1.5">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none resize-none" />
              </div>

              <div>
                <label className="block text-xs font-body font-medium text-forest mb-1.5">Product Images</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
                {editingProduct?.images?.length > 0 && imageFiles.length === 0 && (
                  <p className="text-xs text-olive mt-1">Current: {editingProduct.images.length} images (uploading new images will replace them)</p>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none">
                    <option value="">Select</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Price (₹) *</label>
                  <input name="price" type="number" value={formData.price} onChange={handleChange} required min="0" className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Discount Price (₹)</label>
                  <input name="discountPrice" type="number" value={formData.discountPrice} onChange={handleChange} min="0" className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Stock *</label>
                  <input name="stock" type="number" value={formData.stock} onChange={handleChange} required min="0" className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Shelf Life</label>
                  <input name="shelfLife" value={formData.shelfLife} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" placeholder="e.g. 6 months" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4 text-gold focus:ring-gold border-gold/30 rounded" />
                  <span className="text-sm font-body text-forest">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="bestseller" checked={formData.bestseller} onChange={handleChange} className="w-4 h-4 text-gold focus:ring-gold border-gold/30 rounded" />
                  <span className="text-sm font-body text-forest">Bestseller</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gold/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl border border-gold/20 font-body text-sm text-olive hover:bg-cream transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProducts;
