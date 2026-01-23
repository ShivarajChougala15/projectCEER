import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaPlus, FaTimes } from 'react-icons/fa';

const CreateBOM = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [bomMaterials, setBomMaterials] = useState([{ name: '', quantity: '', specifications: '', unit: 'pcs' }]);
    const [boms, setBoms] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBOMs();
    }, []);

    const fetchBOMs = async () => {
        try {
            const response = await api.get('/bom');
            // Backend returns { success, count, boms }
            setBoms(response.data.boms || []);
        } catch (err) {
            console.error('Error fetching BOMs:', err);
            // Set empty array on error
            setBoms([]);
        }
    };

    const addMaterialRow = () => {
        setBomMaterials([...bomMaterials, { name: '', quantity: '', specifications: '', unit: 'pcs' }]);
    };

    const removeMaterialRow = (index) => {
        setBomMaterials(bomMaterials.filter((_, i) => i !== index));
    };

    const handleMaterialChange = (index, field, value) => {
        const newMaterials = [...bomMaterials];
        newMaterials[index][field] = value;
        setBomMaterials(newMaterials);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            await api.post('/bom', { materials: bomMaterials });
            setSuccess('BOM created successfully! Your guide will be notified.');
            setBomMaterials([{ name: '', quantity: '', specifications: '', unit: 'pcs' }]);
            fetchBOMs();
            setSubmitting(false);
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create BOM');
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/student/dashboard');
    };

    const getFilteredBOMs = () => {
        switch (activeTab) {
            case 'pending':
                return boms.filter(bom => bom.status === 'pending');
            case 'approved':
                return boms.filter(bom =>
                    bom.status === 'guide-approved' ||
                    bom.status === 'labincharge-approved' ||
                    bom.status === 'completed'
                );
            case 'rejected':
                return boms.filter(bom =>
                    bom.status === 'guide-rejected' ||
                    bom.status === 'labincharge-rejected'
                );
            case 'all':
            default:
                return boms;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'guide-approved':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'labincharge-approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'guide-rejected':
            case 'labincharge-rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredBOMs = getFilteredBOMs();

    return (
        <div className="min-h-screen bg-[#fcfbf9] antialiased">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 bg-[#8C8278] text-white">
                <div className="text-xl font-semibold tracking-tighter underline decoration-white/30 underline-offset-8">
                    CEER.LAB
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden md:block text-[10px] uppercase tracking-wider opacity-70">{user.name}</span>
                    <button
                        onClick={logout}
                        className="text-[10px] uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleCancel}
                        className="text-sm text-stone-500 hover:text-stone-700 mb-4 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="font-serif text-5xl text-stone-800 mb-3">BOM Management</h1>
                    <p className="text-stone-500 text-sm">Create and manage your Bill of Materials requests</p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-sm">
                        {success}
                    </div>
                )}

                <div className="space-y-8">
                    {/* BOM Creation Form */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-sm shadow-xl shadow-stone-200/40 border border-stone-100 p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="border-b border-stone-200 pb-4 mb-6">
                                    <h2 className="font-serif text-2xl text-stone-800">Create New BOM</h2>
                                    <p className="text-stone-400 text-xs mt-1">Add all materials required for your project</p>
                                </div>

                                {bomMaterials.map((material, index) => (
                                    <div key={index} className="p-6 bg-stone-50 rounded-sm border border-stone-200 relative">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-stone-600 text-sm font-medium">Material {index + 1}</p>
                                            {bomMaterials.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMaterialRow(index)}
                                                    className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                                                >
                                                    <FaTimes /> Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">
                                                    Material Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={material.name}
                                                    onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-400 transition-all rounded-sm"
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">
                                                        Quantity *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={material.quantity}
                                                        onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-400 transition-all rounded-sm"
                                                        required
                                                        min="1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">
                                                        Unit
                                                    </label>
                                                    <select
                                                        value={material.unit}
                                                        onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-400 transition-all rounded-sm"
                                                    >
                                                        <option value="pcs">Pieces</option>
                                                        <option value="kg">Kilograms</option>
                                                        <option value="m">Meters</option>
                                                        <option value="l">Liters</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">
                                                    Specifications
                                                </label>
                                                <input
                                                    type="text"
                                                    value={material.specifications}
                                                    onChange={(e) => handleMaterialChange(index, 'specifications', e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-400 transition-all rounded-sm"
                                                    placeholder="e.g., 5V, 2A"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addMaterialRow}
                                    className="w-full py-3 bg-stone-100 text-stone-700 text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm hover:bg-stone-200 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <FaPlus /> Add Another Material
                                </button>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 px-6 py-3 bg-stone-200 text-stone-700 text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm hover:bg-stone-300 transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-6 py-3 bg-[#8C8278] text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm hover:bg-[#7a7268] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit BOM Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* BOM Requests List */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-sm shadow-xl shadow-stone-200/40 border border-stone-100 p-8">
                            <div className="border-b border-stone-200 pb-4 mb-6">
                                <h2 className="font-serif text-2xl text-stone-800">BOM Requests</h2>
                                <p className="text-stone-400 text-xs mt-1">View and track your material requests</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 border-b border-stone-200">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === 'pending'
                                        ? 'text-stone-800 border-b-2 border-[#8C8278]'
                                        : 'text-stone-400 hover:text-stone-600'
                                        }`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => setActiveTab('approved')}
                                    className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === 'approved'
                                        ? 'text-stone-800 border-b-2 border-[#8C8278]'
                                        : 'text-stone-400 hover:text-stone-600'
                                        }`}
                                >
                                    Approved
                                </button>
                                <button
                                    onClick={() => setActiveTab('rejected')}
                                    className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === 'rejected'
                                        ? 'text-stone-800 border-b-2 border-[#8C8278]'
                                        : 'text-stone-400 hover:text-stone-600'
                                        }`}
                                >
                                    Rejected
                                </button>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === 'all'
                                        ? 'text-stone-800 border-b-2 border-[#8C8278]'
                                        : 'text-stone-400 hover:text-stone-600'
                                        }`}
                                >
                                    All
                                </button>
                            </div>

                            {/* BOM List */}
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {filteredBOMs.length === 0 ? (
                                    <div className="text-center py-12 text-stone-400">
                                        <p className="text-sm">No {activeTab !== 'all' ? activeTab : ''} BOM requests found</p>
                                    </div>
                                ) : (
                                    filteredBOMs.map((bom) => (
                                        <div key={bom._id} className="p-4 bg-stone-50 rounded-sm border border-stone-200 hover:border-stone-300 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
                                                        {new Date(bom.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(bom.status)}`}>
                                                        {bom.status === 'guide-approved' ? 'Guide Approved' :
                                                            bom.status === 'guide-rejected' ? 'Guide Rejected' :
                                                                bom.status === 'labincharge-approved' ? 'Lab Approved' :
                                                                    bom.status === 'labincharge-rejected' ? 'Lab Rejected' :
                                                                        bom.status === 'completed' ? 'Completed' :
                                                                            bom.status.charAt(0).toUpperCase() + bom.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {bom.materials.map((material, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        <span className="font-medium text-stone-700">{material.name}</span>
                                                        <span className="text-stone-400"> - {material.quantity} {material.unit}</span>
                                                        {material.specifications && (
                                                            <span className="text-stone-400 text-xs block">{material.specifications}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {bom.remarks && (
                                                <div className="mt-3 pt-3 border-t border-stone-200">
                                                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Remarks</p>
                                                    <p className="text-sm text-stone-600">{bom.remarks}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBOM;
