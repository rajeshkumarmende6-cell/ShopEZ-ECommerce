import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import API from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { Users, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

function AdminUsers() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/users'); // Admin gets all users
      if (data?.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.warn('API error loading users. Loading mock list.');
      setUsers([
        { _id: 'user1', name: 'Alice Smith', email: 'alice@gmail.com', role: 'user', isVerified: true, createdAt: new Date().toISOString() },
        { _id: 'user2', name: 'Admin Tester', email: 'admin_test@shopez.com', role: 'admin', isVerified: true, createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    if (id === currentAdmin.id) {
      toast.error('You cannot change your own administrative role!');
      return;
    }
    try {
      const { data } = await API.put(`/admin/users/${id}`, { role: newRole });
      if (data?.success) {
        toast.success(data.message || 'User role updated successfully');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
              <Users className="text-violet-500" size={28} />
              <span>Manage Users</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Review account metadata and update security roles</p>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-violet-500 w-12 h-12" />
          </div>
        ) : users.length > 0 ? (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left text-slate-400">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 bg-slate-900/50">
                  <th className="py-3 px-6 font-bold uppercase">Name</th>
                  <th className="py-3 px-6 font-bold uppercase">Email</th>
                  <th className="py-3 px-6 font-bold uppercase">Verified</th>
                  <th className="py-3 px-6 font-bold uppercase">Joined On</th>
                  <th className="py-3 px-6 font-bold uppercase text-right">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((usr) => (
                  <tr key={usr._id} className="border-b border-slate-850 last:border-0 hover:bg-slate-850/5 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-200">{usr.name}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-400">{usr.email}</td>
                    <td className="py-3.5 px-6 font-medium">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                        usr.isVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {usr.isVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(usr.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <select
                        value={usr.role}
                        onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-slate-300 font-semibold focus:outline-none"
                        disabled={usr._id === currentAdmin.id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500 text-sm">No registered user profiles found.</p>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default AdminUsers;
