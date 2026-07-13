import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import API from '../../services/api';
import { Box, ArrowLeft, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Images state
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const { data } = await API.get('/categories');
        if (data?.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.warn('Could not load categories list for form selection');
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Load product details on Edit mode
  const fetchProduct = useCallback(async () => {
    try {
      setProductLoading(true);
      const { data } = await API.get(`/products/${id}`);
      if (data?.success) {
        const prod = data.product;
        setValue('name', prod.name);
        setValue('brand', prod.brand);
        setValue('description', prod.description);
        setValue('price', prod.price);
        setValue('discountPrice', prod.discountPrice);
        setValue('category', prod.category?._id || prod.category);
        setValue('stock', prod.stock);
        setValue('isFeatured', prod.isFeatured);
        setValue('isBestSeller', prod.isBestSeller);
        setExistingImages(prod.images || []);
      }
    } catch (err) {
      toast.error('Failed to load product details');
      navigate('/admin/products');
    } finally {
      setProductLoading(false);
    }
  }, [id, setValue, navigate]);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [isEditMode, fetchProduct]);

  // Handle local image file selections
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length > 5) {
      toast.error('Maximum 5 images allowed per product');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);

    // Create object URLs for visual previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    if (!isEditMode && selectedFiles.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('brand', data.brand);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('discountPrice', data.discountPrice || 0);
      formData.append('category', data.category);
      formData.append('stock', data.stock || 0);
      formData.append('isFeatured', data.isFeatured);
      formData.append('isBestSeller', data.isBestSeller);

      // Append new files
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      let res;
      if (isEditMode) {
        res = await API.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data?.success) {
        toast.success(res.data.message || 'Product saved successfully!');
        navigate('/admin/products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product details');
    } finally {
      setSubmitting(false);
    }
  };

  if (productLoading || categoriesLoading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="animate-spin text-violet-500 w-12 h-12" />
          <p className="text-slate-500 text-sm">Synchronizing form fields...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Navigation / Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <Link to="/admin/products" className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <Box size={24} className="text-violet-500" />
              <span>{isEditMode ? 'Edit Product Details' : 'Create New Product'}</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Please provide specifications and images for the storefront catalog</p>
          </div>
        </div>

        {/* Product Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-slate-900 border border-slate-800/80 p-6 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            
            {/* Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Name</label>
              <input
                type="text"
                placeholder="e.g. SmartWatch X100"
                className={`w-full bg-slate-950 border ${errors.name ? 'border-red-500' : 'border-slate-800'} rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20`}
                {...register('name', { required: 'Product name is required' })}
              />
              {errors.name && <span className="text-[10px] text-red-400 pl-1">{errors.name.message}</span>}
            </div>

            {/* Brand */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Fossil"
                className={`w-full bg-slate-950 border ${errors.brand ? 'border-red-500' : 'border-slate-800'} rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none`}
                {...register('brand', { required: 'Brand is required' })}
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Catalog Category</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-250 focus:outline-none"
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Original Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="199.99"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none"
                {...register('price', { required: 'Price is required', min: 0 })}
              />
            </div>

            {/* Discount Price */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Discounted Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="149.99 (0 if none)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none"
                {...register('discountPrice')}
              />
            </div>

            {/* Stock Count */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inventory Stock Count</label>
              <input
                type="number"
                placeholder="50"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none"
                {...register('stock', { required: 'Stock is required', min: 0 })}
              />
            </div>

            {/* Feature Flags */}
            <div className="col-span-1 flex items-center gap-6 pt-4 pl-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-350">
                <input type="checkbox" className="rounded bg-slate-950 border-slate-800 text-violet-650" {...register('isFeatured')} />
                <span>Featured Releases</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-350">
                <input type="checkbox" className="rounded bg-slate-950 border-slate-800 text-violet-650" {...register('isBestSeller')} />
                <span>Best Sellers</span>
              </label>
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
              <textarea
                rows={4}
                placeholder="Enter complete technical specifications..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none resize-none"
                {...register('description', { required: true })}
              ></textarea>
            </div>

            {/* 3. Image Upload Section */}
            <div className="space-y-3 sm:col-span-2 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Product Gallery (Max 5 images)</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {/* Existing Images (Edit mode) */}
                {existingImages.map((img, idx) => (
                  <div key={img.public_id || idx} className="relative rounded-xl overflow-hidden aspect-square border border-slate-800 bg-slate-950">
                    <img src={img.url} alt="Existing product preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 text-[9px] bg-slate-900/90 text-slate-500 py-0.5 px-1.5 rounded">Uploaded</span>
                  </div>
                ))}

                {/* Local Previews */}
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden aspect-square border border-violet-500/25 bg-slate-950">
                    <img src={preview} alt="Selected file preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-650 text-white rounded-full hover:bg-red-550 transition cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                {existingImages.length + selectedFiles.length < 5 && (
                  <label className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl flex flex-col items-center justify-center aspect-square text-slate-500 hover:text-slate-350 cursor-pointer transition select-none">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <ImageIcon size={22} />
                    <span className="text-[10px] mt-1.5 font-bold">Add Image</span>
                  </label>
                )}
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-800">
            <Link
              to="/admin/products"
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-2.5 px-6 rounded-xl transition text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-violet-600 hover:bg-violet-550 text-white font-bold py-2.5 px-6 rounded-xl transition shadow shadow-violet-950/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
}

export default AdminProductForm;
