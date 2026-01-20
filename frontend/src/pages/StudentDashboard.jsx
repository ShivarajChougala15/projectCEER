import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './StudentDashboard.css';
import { FaPlus, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [boms, setBoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [materials, setMaterials] = useState([{ name: '', quantity: '', specifications: '', unit: 'pcs' }]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchBOMs();
    }, []);

    const fetchBOMs = async () => {
        try {
            const { data } = await api.get('/bom');
            setBoms(data.boms);
        } catch (err) {
            setError('Failed to fetch BOMs');
        } finally {
            setLoading(false);
        }
    };

    const addMaterialRow = () => {
        setMaterials([...materials, { name: '', quantity: '', specifications: '', unit: 'pcs' }]);
    };

    const removeMaterialRow = (index) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const handleMaterialChange = (index, field, value) => {
        const newMaterials = [...materials];
        newMaterials[index][field] = value;
        setMaterials(newMaterials);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/bom', { materials });
            setSuccess('BOM created successfully! Your guide will be notified.');
            setShowCreateForm(false);
            setMaterials([{ name: '', quantity: '', specifications: '', unit: 'pcs' }]);
            fetchBOMs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create BOM');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: <span className="badge badge-warning">Pending Guide Approval</span>,
            'guide-approved': <span className="badge badge-info">Guide Approved</span>,
            'guide-rejected': <span className="badge badge-danger">Guide Rejected</span>,
            'labincharge-approved': <span className="badge badge-success">Lab Approved</span>,
            'labincharge-rejected': <span className="badge badge-danger">Lab Rejected</span>,
            completed: <span className="badge badge-success">Completed</span>,
        };
        return badges[status] || status;
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Student Dashboard</h1>
                        <p className="text-muted">Welcome back, {user.name}!</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                        <FaPlus /> Create New BOM
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {showCreateForm && (
                    <div className="card mb-3">
                        <h2>Create Bill of Materials</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="materials-list">
                                {materials.map((material, index) => (
                                    <div key={index} className="material-row">
                                        <div className="input-group">
                                            <label>Material Name</label>
                                            <input
                                                type="text"
                                                value={material.name}
                                                onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Quantity</label>
                                            <input
                                                type="number"
                                                value={material.quantity}
                                                onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)}
                                                required
                                                min="1"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Unit</label>
                                            <select
                                                value={material.unit}
                                                onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                                            >
                                                <option value="pcs">Pieces</option>
                                                <option value="kg">Kilograms</option>
                                                <option value="m">Meters</option>
                                                <option value="l">Liters</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>Specifications</label>
                                            <input
                                                type="text"
                                                value={material.specifications}
                                                onChange={(e) => handleMaterialChange(index, 'specifications', e.target.value)}
                                                placeholder="e.g., 5V, 2A"
                                            />
                                        </div>
                                        {materials.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => removeMaterialRow(index)}
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-outline" onClick={addMaterialRow}>
                                    Add Material
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Submit BOM
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="boms-section">
                    <h2>My BOM Requests</h2>
                    {boms.length === 0 ? (
                        <div className="card text-center">
                            <p className="text-muted">No BOM requests yet. Create your first one!</p>
                        </div>
                    ) : (
                        <div className="boms-grid">
                            {boms.map((bom) => (
                                <div key={bom._id} className="bom-card card">
                                    <div className="bom-header">
                                        <h3>BOM Request</h3>
                                        {getStatusBadge(bom.status)}
                                    </div>
                                    <div className="bom-date">
                                        <FaClock /> {new Date(bom.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="bom-materials">
                                        <h4>Materials:</h4>
                                        <ul>
                                            {bom.materials.map((material, idx) => (
                                                <li key={idx}>
                                                    {material.name} - {material.quantity} {material.unit}
                                                    {material.specifications && ` (${material.specifications})`}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {bom.guideComments && (
                                        <div className="bom-comments">
                                            <strong>Guide Comments:</strong> {bom.guideComments}
                                        </div>
                                    )}
                                    {bom.labinchargeComments && (
                                        <div className="bom-comments">
                                            <strong>Lab Comments:</strong> {bom.labinchargeComments}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
