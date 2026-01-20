import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './StudentDashboard.css';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [boms, setBoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBOM, setSelectedBOM] = useState(null);
    const [comments, setComments] = useState('');
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

    const handleApprove = async (bomId) => {
        try {
            await api.put(`/bom/${bomId}/guide-approve`, { comments });
            setSuccess('BOM approved successfully!');
            setSelectedBOM(null);
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
            await api.put(`/bom/${bomId}/guide-reject`, { comments });
            setSuccess('BOM rejected');
            setSelectedBOM(null);
            setComments('');
            fetchBOMs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject BOM');
        }
    };

    const pendingBOMs = boms.filter((bom) => bom.status === 'pending');

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
                        <h1>Faculty Dashboard</h1>
                        <p className="text-muted">Welcome, {user.name}!</p>
                    </div>
                    <div className="stats-mini">
                        <div className="stat-mini">
                            <span className="stat-number">{pendingBOMs.length}</span>
                            <span className="stat-label">Pending Approvals</span>
                        </div>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="boms-section">
                    <h2>Pending BOM Requests</h2>
                    {pendingBOMs.length === 0 ? (
                        <div className="card text-center">
                            <p className="text-muted">No pending BOM requests</p>
                        </div>
                    ) : (
                        <div className="boms-grid">
                            {pendingBOMs.map((bom) => (
                                <div key={bom._id} className="bom-card card">
                                    <div className="bom-header">
                                        <h3>{bom.team?.teamName || 'Team'}</h3>
                                        <span className="badge badge-warning">Pending</span>
                                    </div>
                                    <p className="text-muted">
                                        Submitted by: {bom.createdBy?.name}
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
                                    <div className="input-group">
                                        <label>Comments (optional)</label>
                                        <textarea
                                            value={selectedBOM === bom._id ? comments : ''}
                                            onChange={(e) => {
                                                setSelectedBOM(bom._id);
                                                setComments(e.target.value);
                                            }}
                                            placeholder="Add comments..."
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleApprove(bom._id)}
                                        >
                                            Approve
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
                    <h2>All BOM Requests</h2>
                    <div className="boms-grid">
                        {boms.map((bom) => (
                            <div key={bom._id} className="bom-card card">
                                <div className="bom-header">
                                    <h3>{bom.team?.teamName || 'Team'}</h3>
                                    <span className={`badge badge-${bom.status.includes('approved') ? 'success' : bom.status.includes('rejected') ? 'danger' : 'warning'}`}>
                                        {bom.status}
                                    </span>
                                </div>
                                <p className="text-muted">
                                    Submitted: {new Date(bom.createdAt).toLocaleDateString()}
                                </p>
                                <div className="bom-materials">
                                    <h4>Materials:</h4>
                                    <ul>
                                        {bom.materials.map((material, idx) => (
                                            <li key={idx}>
                                                {material.name} - {material.quantity} {material.unit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
