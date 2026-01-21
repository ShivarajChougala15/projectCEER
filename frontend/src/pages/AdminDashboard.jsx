import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import AdminOverview from '../components/admin/AdminOverview';
import AdminStaff from '../components/admin/AdminStaff';
import AdminUsers from '../components/admin/AdminUsers';
import AdminMaterials from '../components/admin/AdminMaterials';
import AdminEquipment from '../components/admin/AdminEquipment';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Package,
    Wrench,
    BarChart3,
    LogOut,
    Menu,
    X,
    Home,
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'staff', label: 'Staff Directory', icon: Users },
        { id: 'users', label: 'User Management', icon: UserPlus },
        { id: 'materials', label: 'Materials', icon: Package },
        { id: 'equipment', label: 'Equipment', icon: Wrench },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AdminOverview />;
            case 'staff':
                return <AdminStaff />;
            case 'users':
                return <AdminUsers />;
            case 'materials':
                return <AdminMaterials />;
            case 'equipment':
                return <AdminEquipment />;
            case 'analytics':
                return <AdminAnalytics />;
            default:
                return <AdminOverview />;
        }
    };

    const handleNavClick = (id) => {
        setActiveTab(id);
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#fffcf5] font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50">
                <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#005d52] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">C</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-serif text-slate-900">CEER</h1>
                                <p className="text-xs text-gray-500">Administration</p>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-[#005d52] transition-colors"
                        >
                            <Home size={18} />
                            <span className="text-sm">Home</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-100 z-40 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isActive
                                        ? 'bg-[#005d52] text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="pt-16 lg:pl-64 min-h-screen">
                <div className="p-6 lg:p-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
