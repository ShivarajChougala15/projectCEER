import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './StudentDashboard.css';

const LabInchargeDashboard = () => {
    const { user } = useAuth();
    const [boms, setBoms] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchBOMs();
        fetchInventory();
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

    const fetchInventory = async () => {
        try {
            const { data } = await api.get('/inventory');
            setInventory(data.inventory);
        } catch (err) {
            console.error('Failed to fetch inventory');
        }
    };

    const handleApprove = async (bomId) => {
        try {
            await api.put(`/bom/${bomId}/labincharge-approve`, { comments });
            setSuccess('BOM approved successfully!');
            setComments('');
            fetchBOMs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve BOM');
        }
    };

    const handleReject = async (bomId) => {
        if (!comments.trim()) {
            setError('Please provide comments for rejection');
            return;
        }
        try {
            await api.put(`/bom/${bomId}/labincharge-reject`, { comments });
            setSuccess('BOM rejected');
            setComments('');
            fetchBOMs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject BOM');
        }
    };

    const guideApprovedBOMs = boms.filter((bom) => bom.status === 'guide-approved');

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
                        <h1>Lab Incharge Dashboard</h1>
                        <p className="text-muted">Welcome, {user.name}!</p>
                    </div>
                    <div className="stats-mini">
                        <div className="stat-mini">
                            <span className="stat-number">{guideApprovedBOMs.length}</span>
                            <span className="stat-label">Pending Review</span>
                        </div>
                        <div className="stat-mini">
                            <span className="stat-number">{inventory.length}</span>
                            <span className="stat-label">Inventory Items</span>
                        </div>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="boms-section">
                    <h2>Guide-Approved BOMs</h2>
                    {guideApprovedBOMs.length === 0 ? (
                        <div className="card text-center">
                            <p className="text-muted">No guide-approved BOMs pending review</p>
                        </div>
                    ) : (
                        <div className="boms-grid">
                            {guideApprovedBOMs.map((bom) => (
                                <div key={bom._id} className="bom-card card">
                                    <div className="bom-header">
                                        <h3>{bom.team?.teamName || 'Team'}</h3>
                                        <span className="badge badge-info">Guide Approved</span>
                                    </div>
                                    <p className="text-muted">
                                        Guide: {bom.guideApprovedBy?.name}
                                    </p>
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
                                    <div className="input-group">
                                        <label>Comments (optional)</label>
                                        <textarea
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                            placeholder="Add comments..."
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleApprove(bom._id)}
                                        >
                                            Approve & Issue
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleReject(bom._id)}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="boms-section">
                    <h2>Inventory Overview</h2>
                    <div className="card">
                        {inventory.length === 0 ? (
                            <p className="text-muted text-center">No inventory items</p>
                        ) : (
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>Material</th>
                                        <th>Quantity</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.slice(0, 10).map((item) => (
                                        <tr key={item._id}>
                                            <td>{item.materialName}</td>
                                            <td>{item.quantity} {item.unit}</td>
                                            <td>{item.category || 'N/A'}</td>
                                            <td>
                                                {item.quantity <= item.minStockLevel ? (
                                                    <span className="badge badge-danger">Low Stock</span>
                                                ) : (
                                                    <span className="badge badge-success">In Stock</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabInchargeDashboard;
