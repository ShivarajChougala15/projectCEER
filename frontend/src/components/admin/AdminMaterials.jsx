import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Upload,
    Image,
    Package,
    AlertCircle,
    Check,
    FileSpreadsheet,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import ImageUploadZone from '../common/ImageUploadZone';

const AdminMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [bulkData, setBulkData] = useState([]);
    const [bulkUploading, setBulkUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'other',
        density: '',
        energyFactor: '',
        carbonFactor: '',
        unit: 'kg',
        pricePerUnit: '',
        stockQuantity: '',
        supplier: '',
    });

    const categories = ['metal', 'plastic', 'composite', 'electronic', 'chemical', 'other'];

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/materials');
            setMaterials(data.materials);
        } catch (err) {
            setError('Failed to fetch materials');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'other',
            density: '',
            energyFactor: '',
            carbonFactor: '',
            unit: 'kg',
            pricePerUnit: '',
            stockQuantity: '',
            supplier: '',
        });
        setImagePreview(null);
        setImageFile(null);
        setEditingMaterial(null);
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

            if (editingMaterial) {
                await api.put(`/materials/${editingMaterial._id}`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setSuccess('Material updated successfully');
            } else {
                await api.post('/materials', formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setSuccess('Material created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchMaterials();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save material');
        }
    };

    const handleEdit = (material) => {
        setEditingMaterial(material);
        setFormData({
            name: material.name || '',
            description: material.description || '',
            category: material.category || 'other',
            density: material.density || '',
            energyFactor: material.energyFactor || '',
            carbonFactor: material.carbonFactor || '',
            unit: material.unit || 'kg',
            pricePerUnit: material.pricePerUnit || '',
            stockQuantity: material.stockQuantity || '',
            supplier: material.supplier || '',
        });
        setImagePreview(material.imageUrl);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this material?')) return;
        try {
            await api.delete(`/materials/${id}`);
            setSuccess('Material deleted successfully');
            fetchMaterials();
        } catch (err) {
            setError('Failed to delete material');
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
        accept: { 'text/csv': ['.csv'] },
        maxFiles: 1,
    });

    const handleBulkUpload = async () => {
        if (bulkData.length === 0) return;
        setBulkUploading(true);
        try {
            const { data } = await api.post('/materials/bulk-import', { materials: bulkData });
            setSuccess(`Imported ${data.results.success.length} materials. ${data.results.failed.length} failed.`);
            setShowBulkModal(false);
            setBulkData([]);
            fetchMaterials();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to bulk import');
        } finally {
            setBulkUploading(false);
        }
    };

    const filteredMaterials = materials.filter(
        (m) =>
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-2xl font-bold text-gray-900">Materials Management</h1>
                    <p className="text-gray-500">Manage materials with environmental impact factors</p>
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
                        Add Material
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

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                />
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMaterials.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16">
                        <Package className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500">No materials found</p>
                    </div>
                ) : (
                    filteredMaterials.map((material) => (
                        <div key={material._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Image */}
                            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                                {material.imageUrl ? (
                                    <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="w-16 h-16 text-gray-400" />
                                )}
                                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${material.category === 'metal' ? 'bg-slate-100 text-slate-700' :
                                    material.category === 'plastic' ? 'bg-blue-100 text-blue-700' :
                                        material.category === 'electronic' ? 'bg-purple-100 text-purple-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {material.category}
                                </span>
                            </div>
                            {/* Content */}
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 mb-2">{material.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{material.description || 'No description'}</p>

                                {/* Environmental Factors */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500">Density</p>
                                        <p className="font-semibold text-gray-900">{material.density || '-'}</p>
                                    </div>
                                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                                        <p className="text-xs text-gray-500">Energy</p>
                                        <p className="font-semibold text-emerald-700">{material.energyFactor || '-'}</p>
                                    </div>
                                    <div className="text-center p-2 bg-amber-50 rounded-lg">
                                        <p className="text-xs text-gray-500">Carbon</p>
                                        <p className="font-semibold text-amber-700">{material.carbonFactor || '-'}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(material)}
                                        className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Edit className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(material._id)}
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

            {/* Material Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingMaterial ? 'Edit Material' : 'Add New Material'}
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
                                label="Material Image"
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

                            {/* Environmental Factors */}
                            <div className="bg-emerald-50 rounded-xl p-4">
                                <h3 className="font-medium text-emerald-800 mb-3">Environmental Factors</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Density (kg/m³)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.density}
                                            onChange={(e) => setFormData({ ...formData, density: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Energy Factor (MJ/kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.energyFactor}
                                            onChange={(e) => setFormData({ ...formData, energyFactor: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Carbon Factor (kgCO₂/kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.carbonFactor}
                                            onChange={(e) => setFormData({ ...formData, carbonFactor: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <input
                                        type="text"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.pricePerUnit}
                                        onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                <input
                                    type="text"
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                            >
                                {editingMaterial ? 'Update Material' : 'Create Material'}
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
                            <h2 className="text-xl font-bold text-gray-900">Bulk Import Materials</h2>
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
                                    {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here, or click to select'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    CSV columns: name, description, category, density, energyFactor, carbonFactor, unit
                                </p>
                            </div>

                            {bulkData.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Preview ({bulkData.length} materials)</h3>
                                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Name</th>
                                                    <th className="px-4 py-2 text-left">Category</th>
                                                    <th className="px-4 py-2 text-left">Density</th>
                                                    <th className="px-4 py-2 text-left">Carbon</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {bulkData.slice(0, 5).map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2">{row.name}</td>
                                                        <td className="px-4 py-2">{row.category || '-'}</td>
                                                        <td className="px-4 py-2">{row.density || '-'}</td>
                                                        <td className="px-4 py-2">{row.carbonFactor || '-'}</td>
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
                                        Import {bulkData.length} Materials
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

export default AdminMaterials;
