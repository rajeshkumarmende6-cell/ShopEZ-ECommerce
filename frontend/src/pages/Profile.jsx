import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import MainLayout from '../layouts/MainLayout';
import useAuth from '../hooks/useAuth';
import API from '../services/api';
import { Mail, User, Phone, MapPin, Plus, Trash2, Edit2, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

function Profile() {
  const { user } = useAuth();

  // API State
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // Form toggles
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch user addresses
  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      const { data } = await API.get('/addresses');
      if (data?.success) {
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.warn('API error loading addresses. Using fallback empty list.');
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const onSubmitAddress = async (data) => {
    try {
      if (editingAddressId) {
        // Update Address
        const res = await API.put(`/addresses/${editingAddressId}`, data);
        if (res.data?.success) {
          toast.success('Address updated successfully');
        }
      } else {
        // Create Address
        const res = await API.post('/addresses', data);
        if (res.data?.success) {
          toast.success('Address added successfully');
        }
      }
      closeAddressForm();
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address details');
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setValue('fullName', addr.fullName);
    setValue('phoneNumber', addr.phoneNumber);
    setValue('streetAddress', addr.streetAddress);
    setValue('city', addr.city);
    setValue('state', addr.state);
    setValue('postalCode', addr.postalCode);
    setValue('country', addr.country);
    setValue('isDefault', addr.isDefault);
    setAddressFormOpen(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const { data } = await API.delete(`/addresses/${id}`);
      if (data?.success) {
        toast.success('Address deleted successfully');
        fetchAddresses();
      }
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const closeAddressForm = () => {
    reset();
    setEditingAddressId(null);
    setAddressFormOpen(false);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start select-none">
        
        {/* Left Column: Personal info profile card */}
        <div className="lg:col-span-1 bg-slate-850/30 border border-slate-800/80 p-6 rounded-2xl space-y-6">
          <h2 className="font-extrabold text-xl text-slate-100 pb-3 border-b border-slate-850">My Profile</h2>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-indigo-650 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-violet-950/20">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-200">{user?.name}</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-0.5">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-850 text-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <Mail size={16} className="text-violet-400" />
              <span className="truncate">{user?.email}</span>
            </div>
            
            <div className="flex items-center gap-3 text-slate-400">
              <CheckCircle2 size={16} className={user?.isVerified ? 'text-green-400' : 'text-slate-500'} />
              <span>{user?.isVerified ? 'Verified Account' : 'Unverified Account'}</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Address management */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header row */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <h2 className="font-extrabold text-xl text-slate-100 flex items-center gap-2">
              <MapPin size={22} className="text-violet-500" />
              <span>Manage Shipping Addresses</span>
            </h2>
            
            {!addressFormOpen && (
              <button
                onClick={() => setAddressFormOpen(true)}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-550 text-white font-bold text-xs py-2 px-4 rounded-xl shadow cursor-pointer transition active:scale-[0.98]"
              >
                <Plus size={14} />
                <span>Add Address</span>
              </button>
            )}
          </div>

          {/* 1. Address Form overlay/section */}
          {addressFormOpen && (
            <div className="bg-slate-850/20 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-base text-slate-200">
                {editingAddressId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmitAddress)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <input
                    type="text"
                    className={`w-full bg-slate-900 border ${errors.fullName ? 'border-red-500' : 'border-slate-750'} rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none`}
                    {...register('fullName', { required: 'Full name is required' })}
                  />
                  {errors.fullName && <span className="text-[10px] text-red-400">{errors.fullName.message}</span>}
                </div>

                {/* Phone */}
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                  <input
                    type="text"
                    className={`w-full bg-slate-900 border ${errors.phoneNumber ? 'border-red-500' : 'border-slate-750'} rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none`}
                    {...register('phoneNumber', { required: 'Phone number is required' })}
                  />
                  {errors.phoneNumber && <span className="text-[10px] text-red-400">{errors.phoneNumber.message}</span>}
                </div>

                {/* Street Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Street Address</label>
                  <input
                    type="text"
                    className={`w-full bg-slate-900 border ${errors.streetAddress ? 'border-red-500' : 'border-slate-750'} rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none`}
                    {...register('streetAddress', { required: 'Street address is required' })}
                  />
                  {errors.streetAddress && <span className="text-[10px] text-red-400">{errors.streetAddress.message}</span>}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City</label>
                  <input
                    type="text"
                    className={`w-full bg-slate-900 border ${errors.city ? 'border-red-500' : 'border-slate-750'} rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none`}
                    {...register('city', { required: 'City is required' })}
                  />
                  {errors.city && <span className="text-[10px] text-red-400">{errors.city.message}</span>}
                </div>

                {/* State */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">State</label>
                  <input
                    type="text"
                    className={`w-full bg-slate-900 border ${errors.state ? 'border-red-500' : 'border-slate-750'} rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none`}
                    {...register('state', { required: 'State is required' })}
                  />
                  {errors.state && <span className="text-[10px] text-red-400">{errors.state.message}</span>}
                </div>

                {/* Postal Code */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Postal Code</label>
                  <input
                    type="text"
                    className={`w-full bg-slate-900 border ${errors.postalCode ? 'border-red-500' : 'border-slate-750'} rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none`}
                    {...register('postalCode', { required: 'Postal code is required' })}
                  />
                  {errors.postalCode && <span className="text-[10px] text-red-400">{errors.postalCode.message}</span>}
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Country</label>
                  <input
                    type="text"
                    defaultValue="India"
                    className={`w-full bg-slate-900 border ${errors.country ? 'border-red-500' : 'border-slate-750'} rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none`}
                    {...register('country', { required: 'Country is required' })}
                  />
                </div>

                {/* Default checkbox */}
                <div className="sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-350">
                    <input
                      type="checkbox"
                      className="rounded bg-slate-900 border-slate-750 text-violet-600 focus:ring-violet-500/30 w-4 h-4"
                      {...register('isDefault')}
                    />
                    <span>Set as default shipping address</span>
                  </label>
                </div>

                {/* Action buttons */}
                <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={closeAddressForm}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 px-5 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-550 text-white font-bold text-xs py-2 px-5 rounded-xl transition shadow shadow-violet-950/20"
                  >
                    Save Address
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 2. Addresses Listing */}
          {addressesLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-slate-800/20 h-24 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`border rounded-2xl p-5 space-y-3 relative group transition ${
                    addr.isDefault 
                      ? 'bg-slate-850/30 border-violet-500/30 shadow shadow-violet-950/5' 
                      : 'bg-slate-900/30 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{addr.fullName}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{addr.phoneNumber}</p>
                    </div>
                    {addr.isDefault && (
                      <span className="bg-violet-500/10 text-violet-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-violet-500/25">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed">
                    {addr.streetAddress}, <br />
                    {addr.city}, {addr.state} - <span className="font-semibold text-slate-300">{addr.postalCode}</span>, <br />
                    {addr.country}
                  </p>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-850/50">
                    <button
                      onClick={() => handleEditAddress(addr)}
                      className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      title="Edit Address"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="p-1.5 text-slate-450 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty Addresses State */
            <div className="text-center py-12 bg-slate-850/10 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-500 text-sm">No saved shipping addresses. Click 'Add Address' to set up your delivery destinations.</p>
            </div>
          )}

        </div>

      </div>
    </MainLayout>
  );
}

export default Profile;
