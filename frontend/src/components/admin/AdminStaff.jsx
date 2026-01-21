import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    Users,
    ChevronDown,
    ChevronRight,
    Mail,
    Building2,
    UserCircle,
    Search,
    Filter,
} from 'lucide-react';

const AdminStaff = () => {
    const [staffDirectory, setStaffDirectory] = useState({ faculty: [], labIncharges: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedFaculty, setExpandedFaculty] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('faculty');

    useEffect(() => {
        fetchStaffDirectory();
    }, []);

    const fetchStaffDirectory = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/staff-directory');
            setStaffDirectory(data.staffDirectory);
        } catch (err) {
            setError('Failed to fetch staff directory');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (facultyId) => {
        setExpandedFaculty((prev) => ({
            ...prev,
            [facultyId]: !prev[facultyId],
        }));
    };

    const filteredFaculty = staffDirectory.faculty.filter(
        (f) =>
            f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLabIncharges = staffDirectory.labIncharges.filter(
        (l) =>
            l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-2xl font-bold text-gray-900">Staff Directory</h1>
                    <p className="text-gray-500">View Faculty and Lab Incharges with their assigned teams</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all w-full md:w-72"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('faculty')}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'faculty'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Faculty ({filteredFaculty.length})
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('labincharge')}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'labincharge'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4" />
                        Lab Incharges ({filteredLabIncharges.length})
                    </span>
                </button>
            </div>

            {/* Faculty Tab */}
            {activeTab === 'faculty' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {filteredFaculty.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Users className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-gray-500">No faculty members found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredFaculty.map((faculty) => (
                                <div key={faculty._id} className="transition-colors">
                                    <div
                                        onClick={() => toggleExpand(faculty._id)}
                                        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                                {faculty.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{faculty.name}</h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-4 h-4" />
                                                        {faculty.email}
                                                    </span>
                                                    {faculty.department && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-4 h-4" />
                                                            {faculty.department}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                {faculty.teams?.length || 0} Teams
                                            </span>
                                            {expandedFaculty[faculty._id] ? (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Teams List */}
                                    {expandedFaculty[faculty._id] && faculty.teams?.length > 0 && (
                                        <div className="bg-gray-50 px-5 pb-5">
                                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                                                    <h4 className="font-medium text-gray-700">Assigned Teams</h4>
                                                </div>
                                                <div className="divide-y divide-gray-100">
                                                    {faculty.teams.map((team) => (
                                                        <div key={team._id} className="p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h5 className="font-medium text-gray-900">{team.teamName}</h5>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${team.status === 'active'
                                                                        ? 'bg-emerald-100 text-emerald-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {team.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">{team.projectTitle}</p>
                                                            {team.members?.length > 0 && (
                                                                <div className="flex items-center gap-2 flex-wrap mt-2">
                                                                    <span className="text-xs text-gray-500">Members:</span>
                                                                    {team.members.map((member) => (
                                                                        <span
                                                                            key={member._id}
                                                                            className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700"
                                                                        >
                                                                            {member.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {expandedFaculty[faculty._id] && faculty.teams?.length === 0 && (
                                        <div className="bg-gray-50 px-5 pb-5">
                                            <p className="text-gray-500 text-sm text-center py-4">No teams assigned</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Lab Incharges Tab */}
            {activeTab === 'labincharge' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {filteredLabIncharges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <UserCircle className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-gray-500">No lab incharges found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {filteredLabIncharges.map((labIncharge) => (
                                <div
                                    key={labIncharge._id}
                                    className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                                            {labIncharge.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{labIncharge.name}</h3>
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                                Lab Incharge
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {labIncharge.email}
                                        </div>
                                        {labIncharge.department && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                {labIncharge.department}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminStaff;
