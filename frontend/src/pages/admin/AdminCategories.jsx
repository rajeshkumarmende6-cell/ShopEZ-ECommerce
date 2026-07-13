import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import API from '../../services/api';
import { useForm } from 'react-hook-form';
import { FolderTree, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Editor states
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/categories');
      if (data?.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.warn('API error loading categories. Using mock list.');
      setCategories([
        { _id: 'cat1', name: 'Electronics', description: 'Gadgets and gadgets', slug: 'electronics' },
        { _id: 'cat2', name: 'Footwear', description: 'Shoes and sneakers', slug: 'footwear' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmitCategory = async (data) => {
    try {
      setSubmitting(true);
      if (editingId) {
        // Edit Category
        const res = await API.put(`/categories/${editingId}`, data);
        if (res.data?.success) {
          toast.success('Category updated successfully');
        }
      } else {
        // Create Category
        const res = await API.post('/categories', data);
        if (res.data?.success) {
          toast.success('Category created successfully');
        }
      }
      closeForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setValue('name', cat.name);
    setValue('description', cat.description);
    setValue('image', cat.image);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const { data } = await API.delete(`/categories/${id}`);
      if (data?.success) {
        toast.success(data.message || 'Category deleted successfully');
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const closeForm = () => {
    reset();
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
              <FolderTree className="text-violet-500" size={28} />
              <span>Manage Categories</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Structure products under catalog sections and update slugs</p>
          </div>

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-550 text-white font-bold text-xs py-3 px-5 rounded-xl shadow cursor-pointer transition active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </button>
          )}
        </div>

        {/* Add/Edit Inline Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit(onSubmitCategory)} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4 max-w-xl text-xs">
            <h3 className="font-bold text-sm text-slate-200">{editingId ? 'Edit Category' : 'Create Category'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Name</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 focus:outline-none" {...register('name', { required: true })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Image URL (Cloudinary)</label>
                <input type="text" placeholder="https://example.com" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 focus:outline-none" {...register('image')} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Description</label>
                <textarea rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 focus:outline-none resize-none" {...register('description', { required: true })}></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
              <button type="button" onClick={closeForm} className="px-4 py-1.5 bg-slate-800 rounded-lg">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-1.5 bg-violet-600 rounded-lg text-white">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {/* Categories Grid Table */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-violet-500 w-12 h-12" />
          </div>
        ) : categories.length > 0 ? (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left text-slate-400">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 bg-slate-900/50">
                  <th className="py-3 px-6 font-bold uppercase">Category Name</th>
                  <th className="py-3 px-6 font-bold uppercase">Slug Reference</th>
                  <th className="py-3 px-6 font-bold uppercase">Description</th>
                  <th className="py-3 px-6 font-bold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} className="border-b border-slate-850 last:border-0 hover:bg-slate-850/5 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-200">{cat.name}</td>
                    <td className="py-3.5 px-6 font-mono text-violet-400">{cat.slug}</td>
                    <td className="py-3.5 px-6 truncate max-w-[200px] text-slate-400">{cat.description}</td>
                    <td className="py-3.5 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-1.5 text-slate-450 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500 text-sm">No categories found. Click 'Add Category' to get started.</p>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default AdminCategories;
