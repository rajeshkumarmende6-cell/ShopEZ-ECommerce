import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import API from '../../services/api';
import { 
  Gift, Plus, Edit2, Trash2, Calendar, Loader2, Eye, Check, X, 
  Clock, ArrowUpRight, Megaphone, Image as ImageIcon, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EVENT_TYPES = [
  'Festival Offers',
  'Flash Sales',
  "Today's Deals",
  'Mega Sale Events',
  'Seasonal Offers',
  'Brand Campaigns',
  'New Product Launches',
  'Limited-Time Discounts',
  'Clearance Sales',
  'Custom Promotional Events'
];

function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired', 'scheduled'

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [offerPercentage, setOfferPercentage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [countdownTimer, setCountdownTimer] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaUrl, setCtaUrl] = useState('/products');
  const [bgColor, setBgColor] = useState('#111827');
  const [priority, setPriority] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Banners
  const [desktopBanner, setDesktopBanner] = useState(null);
  const [mobileBanner, setMobileBanner] = useState(null);
  
  // Banner Preview URLs
  const [desktopPreview, setDesktopPreview] = useState('');
  const [mobilePreview, setMobilePreview] = useState('');

  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/promotions');
      if (data?.success) {
        setPromotions(data.promotions);
      }
    } catch (err) {
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setEventType(EVENT_TYPES[0]);
    setOfferPercentage('');
    setCouponCode('');
    setCountdownTimer('');
    setCtaText('Shop Now');
    setCtaUrl('/products');
    setBgColor('#1e1b4b'); // Default dark purple theme
    setPriority('0');
    
    // Set default dates: start now, end in 7 days
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 7);
    
    setStartDate(now.toISOString().slice(0, 16));
    setEndDate(future.toISOString().slice(0, 16));
    setIsActive(true);

    setDesktopBanner(null);
    setMobileBanner(null);
    setDesktopPreview('');
    setMobilePreview('');

    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo) => {
    setEditingId(promo._id);
    setTitle(promo.title);
    setSubtitle(promo.subtitle || '');
    setDescription(promo.description);
    setEventType(promo.eventType);
    setOfferPercentage(promo.offerPercentage !== undefined && promo.offerPercentage !== null ? promo.offerPercentage.toString() : '');
    setCouponCode(promo.couponCode || '');
    setCountdownTimer(promo.countdownTimer ? new Date(promo.countdownTimer).toISOString().slice(0, 16) : '');
    setCtaText(promo.ctaText || 'Shop Now');
    setCtaUrl(promo.ctaUrl || '/products');
    setBgColor(promo.bgColor || '#111827');
    setPriority(promo.priority.toString());
    setStartDate(new Date(promo.startDate).toISOString().slice(0, 16));
    setEndDate(new Date(promo.endDate).toISOString().slice(0, 16));
    setIsActive(promo.isActive);

    setDesktopBanner(null);
    setMobileBanner(null);
    setDesktopPreview(promo.desktopBanner?.url || '');
    setMobilePreview(promo.mobileBanner?.url || '');

    setIsModalOpen(true);
  };

  const handleDesktopFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesktopBanner(file);
      setDesktopPreview(URL.createObjectURL(file));
    }
  };

  const handleMobileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileBanner(file);
      setMobilePreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotional banner?')) return;
    
    try {
      const { data } = await API.delete(`/promotions/${id}`);
      if (data?.success) {
        toast.success('Promotion deleted successfully');
        fetchPromotions();
      }
    } catch (err) {
      toast.error('Failed to delete promotion');
    }
  };

  const handleToggleActive = async (promo) => {
    try {
      const { data } = await API.put(`/promotions/${promo._id}`, {
        isActive: !promo.isActive
      });
      if (data?.success) {
        toast.success(`Banner is now ${!promo.isActive ? 'active' : 'inactive'}`);
        fetchPromotions();
      }
    } catch (err) {
      toast.error('Failed to update banner status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!desktopPreview || !mobilePreview) {
      toast.error('Both desktop and mobile banners are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('description', description);
    formData.append('eventType', eventType);
    formData.append('offerPercentage', offerPercentage);
    formData.append('couponCode', couponCode);
    formData.append('countdownTimer', countdownTimer);
    formData.append('ctaText', ctaText);
    formData.append('ctaUrl', ctaUrl);
    formData.append('bgColor', bgColor);
    formData.append('priority', priority);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('isActive', isActive);

    if (desktopBanner) {
      formData.append('desktopBanner', desktopBanner);
    }
    if (mobileBanner) {
      formData.append('mobileBanner', mobileBanner);
    }

    try {
      setFormLoading(true);
      if (editingId) {
        const { data } = await API.put(`/promotions/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (data?.success) {
          toast.success('Promotion updated successfully');
          setIsModalOpen(false);
          fetchPromotions();
        }
      } else {
        const { data } = await API.post('/promotions', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (data?.success) {
          toast.success('Promotion created successfully');
          setIsModalOpen(false);
          fetchPromotions();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save promotion details');
    } finally {
      setFormLoading(false);
    }
  };

  // Filter Logic
  const filteredPromotions = promotions.filter(p => {
    const now = new Date();
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);

    if (filter === 'active') {
      return p.isActive && start <= now && end >= now;
    }
    if (filter === 'expired') {
      return end < now;
    }
    if (filter === 'scheduled') {
      return start > now && p.isActive;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
              <Megaphone size={28} className="text-violet-400" />
              <span>Promotions & Events</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Create, schedule, prioritize, and manage premium homepage banner grids
            </p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-md shadow-violet-950/20 cursor-pointer"
          >
            <Plus size={18} />
            <span>Create Promo Event</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-slate-850 pb-4 overflow-x-auto">
          {['all', 'active', 'scheduled', 'expired'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition capitalize cursor-pointer ${
                filter === f
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-850'
              }`}
            >
              {f} ({
                promotions.filter(p => {
                  const now = new Date();
                  const start = new Date(p.startDate);
                  const end = new Date(p.endDate);
                  if (f === 'active') return p.isActive && start <= now && end >= now;
                  if (f === 'expired') return end < now;
                  if (f === 'scheduled') return start > now && p.isActive;
                  return true;
                }).length
              })
            </button>
          ))}
        </div>

        {/* Promo Grid / List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-violet-500 w-10 h-10" />
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800 p-12 rounded-2xl text-center space-y-4">
            <Gift className="mx-auto text-slate-600 w-12 h-12" />
            <h3 className="font-bold text-slate-350 text-base">No promotions found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              There are no promo events listed matching this filter. Get started by clicking the button above to add a promotional banner!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredPromotions.map((promo) => {
              const isPromoActive = new Date(promo.startDate) <= new Date() && new Date(promo.endDate) >= new Date() && promo.isActive;
              const isScheduled = new Date(promo.startDate) > new Date() && promo.isActive;
              const isExpired = new Date(promo.endDate) < new Date();

              return (
                <div 
                  key={promo._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-750 transition flex flex-col justify-between shadow-lg shadow-black/10"
                >
                  {/* Top: Card Header info */}
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 bg-violet-950/40 text-violet-400 text-[10px] uppercase font-bold border border-violet-900/20 rounded-md">
                          {promo.eventType}
                        </span>
                        <h3 className="font-bold text-lg text-slate-100 leading-snug mt-1">{promo.title}</h3>
                        {promo.subtitle && <p className="text-slate-400 text-xs">{promo.subtitle}</p>}
                      </div>
                      
                      {/* Status Badges */}
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                        isExpired 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : isPromoActive 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : isScheduled
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-slate-800 text-slate-500 border-slate-750'
                      }`}>
                        {isExpired ? 'Expired' : isPromoActive ? 'Active' : isScheduled ? 'Scheduled' : 'Draft/Inactive'}
                      </span>
                    </div>

                    <p className="text-slate-450 text-xs line-clamp-2 leading-relaxed">{promo.description}</p>

                    {/* Meta stats inside card */}
                    <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-slate-550 block font-bold uppercase">Time Schedule</span>
                        <span className="text-slate-350 flex items-center gap-1">
                          <Calendar size={11} className="text-violet-450" />
                          <span>{new Date(promo.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(promo.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                      </div>
                      <div className="space-y-1 border-l border-slate-850 pl-3">
                        <span className="text-slate-550 block font-bold uppercase">Priority & Discount</span>
                        <span className="text-slate-350 flex items-center gap-2">
                          <span className="bg-slate-850 px-1.5 py-0.5 rounded font-bold text-indigo-400">Prio: {promo.priority}</span>
                          {promo.offerPercentage && (
                            <span className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                              {promo.offerPercentage}% Off
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Preview Images layout */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-2 space-y-1">
                        <span className="text-[10px] text-slate-550 uppercase font-bold">Desktop Banner</span>
                        <div className="aspect-[21/9] bg-slate-950 rounded-lg overflow-hidden border border-slate-850 relative group">
                          <img src={promo.desktopBanner.url} alt="Desktop Preview" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="col-span-1 space-y-1">
                        <span className="text-[10px] text-slate-550 uppercase font-bold">Mobile Banner</span>
                        <div className="aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-850 relative">
                          <img src={promo.mobileBanner.url} alt="Mobile Preview" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Card Footer Triggers */}
                  <div className="p-4 border-t border-slate-850 bg-slate-900/50 flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={promo.isActive}
                        onChange={() => handleToggleActive(promo)}
                        className="rounded text-violet-600 focus:ring-0 w-4 h-4 bg-slate-950 border-slate-800"
                      />
                      <span className={promo.isActive ? 'text-violet-400' : 'text-slate-500'}>
                        {promo.isActive ? 'Status: Active' : 'Status: Inactive'}
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(promo)}
                        className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition hover:text-white cursor-pointer"
                        title="Edit Promo"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(promo._id)}
                        className="p-2 bg-red-950/20 hover:bg-red-900/30 text-red-400 rounded-lg border border-red-900/10 transition hover:text-red-300 cursor-pointer"
                        title="Delete Promo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-850 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-violet-400" size={20} />
                  <h3 className="font-extrabold text-lg text-slate-100">
                    {editingId ? 'Edit Promotional Event' : 'Create New Promotional Event'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Scrollable Wrapper */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Event Type *</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200"
                    >
                      {EVENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Promo Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Event Title *</label>
                    <input 
                      type="text" 
                      required 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="e.g. Black Friday Super Sale"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Subtitle (Optional)</label>
                    <input 
                      type="text" 
                      value={subtitle} 
                      onChange={(e) => setSubtitle(e.target.value)} 
                      placeholder="e.g. Exclusive Premium Deals"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200"
                    />
                  </div>

                  {/* CTA Text */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">CTA Button Text</label>
                    <input 
                      type="text" 
                      value={ctaText} 
                      onChange={(e) => setCtaText(e.target.value)} 
                      placeholder="Shop Now"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200"
                    />
                  </div>

                  {/* CTA Redirect URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Button Redirect URL (Cta Url)</label>
                    <input 
                      type="text" 
                      value={ctaUrl} 
                      onChange={(e) => setCtaUrl(e.target.value)} 
                      placeholder="/products"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200"
                    />
                  </div>

                  {/* Background Color theme */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Background Color Accent (Hex)</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-8 p-0 border-0 bg-transparent rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)} 
                        placeholder="#111827"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Offer Discount Percentage */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Offer Discount % (Optional)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={offerPercentage} 
                      onChange={(e) => setOfferPercentage(e.target.value)} 
                      placeholder="e.g. 50"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200"
                    />
                  </div>

                  {/* Promo Coupon Code */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Coupon Code (Optional)</label>
                    <input 
                      type="text" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value)} 
                      placeholder="e.g. FESTIVAL50"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 uppercase"
                    />
                  </div>

                  {/* Display Priority */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Display Priority (Higher values slide first)</label>
                    <input 
                      type="number" 
                      value={priority} 
                      onChange={(e) => setPriority(e.target.value)} 
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200"
                    />
                  </div>

                  {/* Countdown Timer Optional */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Countdown Timer (Optional End Time)</label>
                    <input 
                      type="datetime-local" 
                      value={countdownTimer} 
                      onChange={(e) => setCountdownTimer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200"
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Start Date & Time *</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">End Date & Time *</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200"
                    />
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Event Description *</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a compelling description summarizing details, eligibility, or campaign items..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 resize-none focus:outline-none"
                  />
                </div>

                {/* Image Upload Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Desktop Upload & Preview */}
                  <div className="space-y-2 border border-slate-850 p-4 rounded-xl bg-slate-950/20">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold text-slate-450 block">Desktop Banner Image *</label>
                      {desktopPreview && <span className="text-[9px] text-green-400 font-bold uppercase">Ready</span>}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={desktopInputRef}
                      onChange={handleDesktopFileChange} 
                      className="hidden" 
                    />
                    <div 
                      onClick={() => desktopInputRef.current.click()}
                      className="aspect-[21/9] rounded-lg border-2 border-dashed border-slate-800 hover:border-violet-500/50 bg-slate-950 cursor-pointer flex flex-col items-center justify-center overflow-hidden transition relative group"
                    >
                      {desktopPreview ? (
                        <>
                          <img src={desktopPreview} alt="Desktop Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <span className="font-bold text-white uppercase text-[10px]">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="mx-auto text-slate-600 mb-1" size={24} />
                          <span className="text-slate-500 block text-[10px]">Click to upload Desktop (Widescreen 21:9)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Upload & Preview */}
                  <div className="space-y-2 border border-slate-850 p-4 rounded-xl bg-slate-950/20">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold text-slate-450 block">Mobile Banner Image *</label>
                      {mobilePreview && <span className="text-[9px] text-green-400 font-bold uppercase">Ready</span>}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={mobileInputRef}
                      onChange={handleMobileFileChange} 
                      className="hidden" 
                    />
                    <div 
                      onClick={() => mobileInputRef.current.click()}
                      className="aspect-square max-h-[160px] mx-auto rounded-lg border-2 border-dashed border-slate-800 hover:border-violet-500/50 bg-slate-950 cursor-pointer flex flex-col items-center justify-center overflow-hidden transition relative group"
                    >
                      {mobilePreview ? (
                        <>
                          <img src={mobilePreview} alt="Mobile Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <span className="font-bold text-white uppercase text-[10px]">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="mx-auto text-slate-600 mb-1" size={24} />
                          <span className="text-slate-500 block text-[10px]">Click to upload Mobile (1:1 Square)</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Status Trigger Toggle */}
                <div className="flex items-center gap-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-violet-600 focus:ring-0 w-4 h-4 bg-slate-950 border-slate-800"
                  />
                  <label htmlFor="isActive" className="cursor-pointer">
                    <span className="font-bold text-slate-200 block">Make promotion active immediately</span>
                    <span className="text-[10px] text-slate-500 block">If active and current date fits within dates, it will automatically show on storefront hero.</span>
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-850 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 bg-slate-850 hover:bg-slate-800 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-2 px-6 rounded-xl transition disabled:opacity-50 cursor-pointer"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Publish Promotion</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default AdminPromotions;
