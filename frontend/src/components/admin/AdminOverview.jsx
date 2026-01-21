import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    Users,
    Briefcase,
    Package,
    Wrench,
    FileText,
} from 'lucide-react';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProjects: 0,
        totalMaterials: 0,
        totalEquipment: 0,
        totalBoms: 0,
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats').catch(() => ({ data: {} })),
                api.get('/users').catch(() => ({ data: { users: [] } })),
            ]);

            setStats({
                totalUsers: statsRes.data?.stats?.totalUsers || usersRes.data?.users?.length || 0,
                totalProjects: statsRes.data?.stats?.totalProjects || 0,
                totalMaterials: statsRes.data?.stats?.totalMaterials || 0,
                totalEquipment: statsRes.data?.stats?.totalEquipment || 0,
                totalBoms: statsRes.data?.stats?.totalBoms || 0,
            });

            setRecentUsers(usersRes.data?.users?.slice(0, 5) || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users },
        { label: 'Projects', value: stats.totalProjects, icon: Briefcase },
        { label: 'Materials', value: stats.totalMaterials, icon: Package },
        { label: 'Equipment', value: stats.totalEquipment, icon: Wrench },
        { label: 'BOMs', value: stats.totalBoms, icon: FileText },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005d52]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-serif text-slate-900">Overview</h2>
                <p className="text-gray-600 mt-1">Welcome back to the dashboard.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100">
                            <div className="w-10 h-10 bg-[#f0fdf9] text-[#005d52] rounded-xl flex items-center justify-center mb-4">
                                <Icon size={20} />
                            </div>
                            <p className="text-3xl font-serif text-slate-900 mb-1">{stat.value}</p>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-serif text-xl text-slate-900">Recent Users</h3>
                    <button className="text-sm font-medium text-[#005d52] hover:underline">View All</button>
                </div>
                <div>
                    {recentUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No users found</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">Role</th>
                                    <th className="px-6 py-3 font-medium">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#005d52]/10 text-[#005d52] flex items-center justify-center font-bold text-xs">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 capitalize">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
