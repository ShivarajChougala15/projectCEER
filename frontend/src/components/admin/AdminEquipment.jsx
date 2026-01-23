import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Upload,
    Wrench,
    AlertCircle,
    Check,
    FileSpreadsheet,
    Calendar,
    MapPin,
    Settings,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import ImageUploadZone from '../common/ImageUploadZone';

const AdminEquipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [bulkData, setBulkData] = useState([]);
    const [bulkUploading, setBulkUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'other',
        model: '',
        manufacturer: '',
        serialNumber: '',
        location: '',
        status: 'available',
        purchaseDate: '',
        purchasePrice: '',
        warrantyExpiry: '',
    });

    const categories = ['machinery', 'tools', 'electronics', 'testing', 'safety', 'other'];
    const statuses = ['available', 'in-use', 'maintenance', 'retired'];

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/equipment');
            setEquipment(data.equipment);
        } catch (err) {
            setError('Failed to fetch equipment');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'other',
            model: '',
            manufacturer: '',
            serialNumber: '',
            location: '',
            status: 'available',
            purchaseDate: '',
            purchasePrice: '',
            warrantyExpiry: '',
        });
        setImagePreview(null);
        setImageFile(null);
        setEditingEquipment(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formPayload = new FormData();
            Object.keys(formData).forEach((key) => {
                if (formData[key]) formPayload.append(key, formData[key]);
            });
            if (imageFile) {
                formPayload.append('image', imageFile);
            }

            if (editingEquipment) {
                await api.put(`/equipment/${editingEquipment._id}`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setSuccess('Equipment updated successfully');
            } else {
                await api.post('/equipment', formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setSuccess('Equipment created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchEquipment();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save equipment');
        }
    };

    const handleEdit = (item) => {
        setEditingEquipment(item);
        setFormData({
            name: item.name || '',
            description: item.description || '',
            category: item.category || 'other',
            model: item.model || '',
            manufacturer: item.manufacturer || '',
            serialNumber: item.serialNumber || '',
            location: item.location || '',
            status: item.status || 'available',
            purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
            purchasePrice: item.purchasePrice || '',
            warrantyExpiry: item.warrantyExpiry ? item.warrantyExpiry.split('T')[0] : '',
        });
        setImagePreview(item.imageUrl);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this equipment?')) return;
        try {
            await api.delete(`/equipment/${id}`);
            setSuccess('Equipment deleted successfully');
            fetchEquipment();
        } catch (err) {
            setError('Failed to delete equipment');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const onDropCSV = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    setBulkData(results.data.filter((row) => row.name));
                },
            });
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDropCSV,
        accept: { 'text/csv': ['.csv'], 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    const handleBulkUpload = async () => {
        if (bulkData.length === 0) return;
        setBulkUploading(true);
        try {
            const { data } = await api.post('/equipment/bulk-import', { equipment: bulkData });
            setSuccess(`Imported ${data.results.success.length} equipment. ${data.results.failed.length} failed.`);
            setShowBulkModal(false);
            setBulkData([]);
            fetchEquipment();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to bulk import');
        } finally {
            setBulkUploading(false);
        }
    };

    const filteredEquipment = equipment.filter((item) => {
        const matchesSearch =
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-emerald-100 text-emerald-700';
            case 'in-use': return 'bg-blue-100 text-blue-700';
            case 'maintenance': return 'bg-amber-100 text-amber-700';
            case 'retired': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

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
                    <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
                    <p className="text-gray-500">Manage lab equipment and machinery</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Bulk Import
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Equipment
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</span>
                    <button onClick={() => setError('')}><X className="w-5 h-5" /></button>
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2"><Check className="w-5 h-5" />{success}</span>
                    <button onClick={() => setSuccess('')}><X className="w-5 h-5" /></button>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search equipment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                    <option value="">All Status</option>
                    {statuses.map((status) => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</option>
                    ))}
                </select>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEquipment.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16">
                        <Wrench className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500">No equipment found</p>
                    </div>
                ) : (
                    filteredEquipment.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Image */}
                            <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Wrench className="w-16 h-16 text-gray-400" />
                                )}
                                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                    {item.status?.replace('-', ' ')}
                                </span>
                            </div>
                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                                        {item.category}
                                    </span>
                                </div>

                                {item.model && (
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">Model:</span> {item.model}
                                    </p>
                                )}

                                {item.manufacturer && (
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">Manufacturer:</span> {item.manufacturer}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-3 mb-4">
                                    {item.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {item.location}
                                        </span>
                                    )}
                                    {item.purchaseDate && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(item.purchaseDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Edit className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Equipment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                            </h2>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Image Upload */}
                            <ImageUploadZone
                                imagePreview={imagePreview}
                                onImageSelect={(file) => {
                                    setImageFile(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => setImagePreview(reader.result);
                                    reader.readAsDataURL(file);
                                }}
                                onImageRemove={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                }}
                                label="Equipment Image"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                            >
                                {editingEquipment ? 'Update Equipment' : 'Create Equipment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Import Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Bulk Import Equipment</h2>
                            <button onClick={() => { setShowBulkModal(false); setBulkData([]); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <FileSpreadsheet className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">
                                    {isDragActive ? 'Drop the file here' : 'Drag & drop a CSV/PDF file here, or click to select'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    CSV columns: name, description, category, model, manufacturer, location, status
                                </p>
                            </div>

                            {bulkData.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Preview ({bulkData.length} items)</h3>
                                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Name</th>
                                                    <th className="px-4 py-2 text-left">Category</th>
                                                    <th className="px-4 py-2 text-left">Model</th>
                                                    <th className="px-4 py-2 text-left">Location</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {bulkData.slice(0, 5).map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2">{row.name}</td>
                                                        <td className="px-4 py-2">{row.category || '-'}</td>
                                                        <td className="px-4 py-2">{row.model || '-'}</td>
                                                        <td className="px-4 py-2">{row.location || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Import {bulkData.length} Equipment
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

export default AdminEquipment;
