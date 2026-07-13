import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 pt-16 pb-8 transition duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-1.5">
              ShopEZ
            </Link>
            <p className="text-sm leading-relaxed">
              ShopEZ is a next-generation e-commerce platform offering premium quality products, secure checkouts, and lightning-fast worldwide delivery.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-violet-400 hover:border-violet-500/30 transition">
                <Facebook size={16} />
              </a>
              <a href="#" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-violet-400 hover:border-violet-500/30 transition">
                <Twitter size={16} />
              </a>
              <a href="#" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-violet-400 hover:border-violet-500/30 transition">
                <Instagram size={16} />
              </a>
              <a href="#" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-violet-400 hover:border-violet-500/30 transition">
                <Github size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-200 font-bold text-sm tracking-wider uppercase mb-4">Shopping</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/products" className="hover:text-slate-100 transition">All Products</Link>
              </li>
              <li>
                <Link to="/products?isFeatured=true" className="hover:text-slate-100 transition">Featured Collection</Link>
              </li>
              <li>
                <Link to="/products?isBestSeller=true" className="hover:text-slate-100 transition">Best Sellers</Link>
              </li>
              <li>
                <Link to="/products?discountPrice=true" className="hover:text-slate-100 transition">Discounts & Offers</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-slate-200 font-bold text-sm tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/profile" className="hover:text-slate-100 transition">My Account</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-slate-100 transition">Track Orders</Link>
              </li>
              <li>
                <a href="#" className="hover:text-slate-100 transition">Shipping Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-100 transition">Returns & Refunds</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-slate-200 font-bold text-sm tracking-wider uppercase mb-4">Contact Info</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-violet-400 flex-shrink-0 mt-0.5" />
                <span>123 Shoppers Street, Suite 500, Tech City, IN 560001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-violet-400 flex-shrink-0" />
                <span>xxxxxxxxx</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-violet-400 flex-shrink-0" />
                <span>rajeshkumarmende6@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ShopEZ Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
