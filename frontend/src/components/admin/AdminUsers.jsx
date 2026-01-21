import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import {
    UserPlus,
    Upload,
    Search,
    Trash2,
    Edit,
    X,
    Check,
    AlertCircle,
    FileSpreadsheet,
    Users,
    GraduationCap,
    UserCog,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

const AdminUsers = () => {
    const [activeTab, setActiveTab] = useState('student');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkData, setBulkData] = useState([]);
    const [bulkUploading, setBulkUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'student',
        department: '',
    });

    const departments = [
        'Computer Science',
        'Electronics',
        'Mechanical',
        'Civil',
        'Chemical',
        'Electrical',
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users');
            setUsers(data.users);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            setSuccess('User created successfully');
            setShowCreateModal(false);
            setFormData({ name: '', email: '', role: 'student', department: '' });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${userId}`);
            setSuccess('User deleted successfully');
            fetchUsers();
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    setBulkData(results.data.filter((row) => row.name && row.email));
                },
                error: (err) => {
                    setError('Failed to parse CSV file');
                },
            });
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
        },
        maxFiles: 1,
    });

    const handleBulkUpload = async () => {
        if (bulkData.length === 0) return;
        setBulkUploading(true);
        try {
            const usersToUpload = bulkData.map((row) => ({
                name: row.name,
                email: row.email,
                role: row.role || activeTab,
                department: row.department || '',
            }));
            const { data } = await api.post('/admin/bulk-register', { users: usersToUpload });
            setSuccess(`Successfully registered ${data.results.success.length} users. ${data.results.failed.length} failed.`);
            setShowBulkModal(false);
            setBulkData([]);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to bulk register users');
        } finally {
            setBulkUploading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = user.role === activeTab;
        return matchesSearch && matchesRole;
    });

    const tabs = [
        { id: 'student', label: 'Students', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'faculty', label: 'Faculty', icon: <Users className="w-4 h-4" /> },
        { id: 'labincharge', label: 'Lab Staff', icon: <UserCog className="w-4 h-4" /> },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Register and manage users across all roles</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Bulk Upload
                    </button>
                    <button
                        onClick={() => {
                            setFormData({ ...formData, role: activeTab });
                            setShowCreateModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </span>
                    <button onClick={() => setError('')}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        {success}
                    </span>
                    <button onClick={() => setSuccess('')}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-white text-emerald-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Department</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Created</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.department || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="user@kletech.ac.in"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                >
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="labincharge">Lab Incharge</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                            >
                                Create User
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Bulk Upload Users</h2>
                            <button onClick={() => { setShowBulkModal(false); setBulkData([]); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Dropzone */}
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <FileSpreadsheet className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">
                                    {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here, or click to select'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    CSV should have columns: name, email, role (optional), department (optional)
                                </p>
                            </div>

                            {/* Preview */}
                            {bulkData.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Preview ({bulkData.length} users)</h3>
                                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Name</th>
                                                    <th className="px-4 py-2 text-left">Email</th>
                                                    <th className="px-4 py-2 text-left">Role</th>
                                                    <th className="px-4 py-2 text-left">Department</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {bulkData.slice(0, 10).map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2">{row.name}</td>
                                                        <td className="px-4 py-2">{row.email}</td>
                                                        <td className="px-4 py-2">{row.role || activeTab}</td>
                                                        <td className="px-4 py-2">{row.department || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {bulkData.length > 10 && (
                                            <p className="text-center text-gray-500 py-2 text-sm">
                                                +{bulkData.length - 10} more users
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleBulkUpload}
                                disabled={bulkData.length === 0 || bulkUploading}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {bulkUploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Upload {bulkData.length} Users
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
