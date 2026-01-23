import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaArrowLeft, FaCheck, FaTimes, FaCheckCircle, FaTimesCircle, FaHome } from 'react-icons/fa';
import './FacultyPages.css';

const BOMManagement = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [boms, setBoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBOM, setSelectedBOM] = useState(null);
    const [comments, setComments] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

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
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve BOM');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleReject = async (bomId) => {
        if (!comments.trim()) {
            setError('Please provide comments for rejection');
            setTimeout(() => setError(''), 3000);
            return;
        }
        try {
            await api.put(`/bom/${bomId}/guide-reject`, { comments });
            setSuccess('BOM rejected');
            setSelectedBOM(null);
            setComments('');
            fetchBOMs();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject BOM');
            setTimeout(() => setError(''), 3000);
        }
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

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="faculty-page">
            {/* Navigation */}
            <nav className="faculty-nav">
                <button
                    className="nav-home-btn"
                    onClick={() => navigate('/faculty/dashboard')}
                    title="Home"
                >
                    <FaHome />
                </button>
                <div className="nav-right">
                    <span className="nav-user-name">{user.name}</span>
                    <button
                        onClick={logout}
                        className="nav-logout-btn"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="page-header">
                <h1>BOM Management</h1>
                <p>Review and manage Bill of Materials requests from your teams</p>
            </div>

            <div className="page-content">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Tabs */}
                <div className="bom-tabs">
                    <button
                        className={activeTab === 'pending' ? 'active' : ''}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending ({boms.filter(b => b.status === 'pending').length})
                    </button>
                    <button
                        className={activeTab === 'approved' ? 'active' : ''}
                        onClick={() => setActiveTab('approved')}
                    >
                        Approved ({boms.filter(b =>
                            b.status === 'guide-approved' ||
                            b.status === 'labincharge-approved' ||
                            b.status === 'completed'
                        ).length})
                    </button>
                    <button
                        className={activeTab === 'rejected' ? 'active' : ''}
                        onClick={() => setActiveTab('rejected')}
                    >
                        Rejected ({boms.filter(b =>
                            b.status === 'guide-rejected' ||
                            b.status === 'labincharge-rejected'
                        ).length})
                    </button>
                    <button
                        className={activeTab === 'all' ? 'active' : ''}
                        onClick={() => setActiveTab('all')}
                    >
                        All ({boms.length})
                    </button>
                </div>

                {/* BOM List */}
                {getFilteredBOMs().length === 0 ? (
                    <div className="empty-state">
                        <p>No {activeTab !== 'all' ? activeTab : ''} BOM requests found</p>
                    </div>
                ) : (
                    <div className="boms-list">
                        {getFilteredBOMs().map((bom) => (
                            <div key={bom._id} className="bom-item">
                                <div className="bom-item-header">
                                    <h3>{bom.team?.teamName || 'Team'}</h3>
                                    <span className={`status-badge ${bom.status === 'guide-approved' ||
                                            bom.status === 'labincharge-approved' ||
                                            bom.status === 'completed' ? 'approved' :
                                            bom.status === 'guide-rejected' ||
                                                bom.status === 'labincharge-rejected' ? 'rejected' :
                                                'pending'
                                        }`}>
                                        {(bom.status === 'guide-approved' ||
                                            bom.status === 'labincharge-approved' ||
                                            bom.status === 'completed') ? <FaCheckCircle /> :
                                            (bom.status === 'guide-rejected' ||
                                                bom.status === 'labincharge-rejected') ? <FaTimesCircle /> : null}
                                        {bom.status === 'guide-approved' ? 'Guide Approved' :
                                            bom.status === 'guide-rejected' ? 'Guide Rejected' :
                                                bom.status === 'labincharge-approved' ? 'Lab Approved' :
                                                    bom.status === 'labincharge-rejected' ? 'Lab Rejected' :
                                                        bom.status === 'completed' ? 'Completed' :
                                                            bom.status.charAt(0).toUpperCase() + bom.status.slice(1)}
                                    </span>
                                </div>
                                <p className="bom-meta">
                                    Submitted by: {bom.createdBy?.name} ({bom.createdBy?.email})
                                </p>
                                <p className="bom-meta">
                                    Date: {new Date(bom.createdAt).toLocaleDateString()}
                                </p>

                                {bom.team?.problemStatement && (
                                    <div className="problem-statement">
                                        <strong>Problem Statement:</strong>
                                        <p>{bom.team.problemStatement}</p>
                                    </div>
                                )}

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

                                {bom.remarks && (
                                    <div className="bom-remarks">
                                        <strong>Remarks:</strong>
                                        <p>{bom.remarks}</p>
                                    </div>
                                )}

                                {bom.status === 'pending' && (
                                    <div className="bom-actions">
                                        <textarea
                                            value={selectedBOM === bom._id ? comments : ''}
                                            onChange={(e) => {
                                                setSelectedBOM(bom._id);
                                                setComments(e.target.value);
                                            }}
                                            placeholder="Add comments (optional)..."
                                            rows="3"
                                        />
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleApprove(bom._id)}
                                            >
                                                <FaCheck /> Approve
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleReject(bom._id)}
                                            >
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BOMManagement;
