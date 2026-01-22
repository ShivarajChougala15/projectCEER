import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './StudentDashboard.css';
import { FaPlus, FaUsers, FaTimes } from 'react-icons/fa';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [boms, setBoms] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBOM, setSelectedBOM] = useState(null);
    const [comments, setComments] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Team creation state
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [teamData, setTeamData] = useState({
        teamName: '',
        problemStatement: '',
        selectedStudents: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bomsRes, studentsRes] = await Promise.allSettled([
                api.get('/bom'),
                api.get('/users/available-students')
            ]);

            if (bomsRes.status === 'fulfilled') {
                setBoms(bomsRes.value.data.boms);
            }

            if (studentsRes.status === 'fulfilled') {
                setAvailableStudents(studentsRes.value.data.students);
            }
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchBOMs = async () => {
        try {
            const { data } = await api.get('/bom');
            setBoms(data.boms);
        } catch (err) {
            setError('Failed to fetch BOMs');
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

    const handleStudentToggle = (studentId) => {
        setTeamData(prev => ({
            ...prev,
            selectedStudents: prev.selectedStudents.includes(studentId)
                ? prev.selectedStudents.filter(id => id !== studentId)
                : [...prev.selectedStudents, studentId]
        }));
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!teamData.teamName.trim()) {
            setError('Please enter a team name');
            return;
        }

        if (!teamData.problemStatement.trim()) {
            setError('Please enter a problem statement');
            return;
        }

        if (teamData.selectedStudents.length === 0) {
            setError('Please select at least one student');
            return;
        }

        try {
            await api.post('/teams', {
                teamName: teamData.teamName,
                projectTitle: teamData.problemStatement,
                projectDescription: '',
                members: teamData.selectedStudents,
                guide: user.id
            });

            setSuccess('Team created successfully!');
            setShowCreateTeam(false);
            setTeamData({
                teamName: '',
                problemStatement: '',
                selectedStudents: []
            });

            // Refresh available students
            const { data } = await api.get('/users/available-students');
            setAvailableStudents(data.students);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create team');
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
                        <div className="stat-mini">
                            <span className="stat-number">{availableStudents.length}</span>
                            <span className="stat-label">Available Students</span>
                        </div>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Team Creation Section */}
                <div className="info-section">
                    <div className="section-header">
                        <h2><FaUsers /> Create Team</h2>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateTeam(!showCreateTeam)}
                        >
                            <FaPlus /> {showCreateTeam ? 'Cancel' : 'New Team'}
                        </button>
                    </div>

                    {showCreateTeam && (
                        <div className="card">
                            <form onSubmit={handleCreateTeam}>
                                <div className="input-group">
                                    <label>Team Name *</label>
                                    <input
                                        type="text"
                                        value={teamData.teamName}
                                        onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
                                        placeholder="Enter team name"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Problem Statement *</label>
                                    <textarea
                                        value={teamData.problemStatement}
                                        onChange={(e) => setTeamData({ ...teamData, problemStatement: e.target.value })}
                                        placeholder="Describe the problem statement or project idea"
                                        rows="4"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Select Students * ({teamData.selectedStudents.length} selected)</label>
                                    {availableStudents.length === 0 ? (
                                        <p className="text-muted">No available students. All students are already assigned to teams.</p>
                                    ) : (
                                        <div className="student-selection-grid">
                                            {availableStudents.map((student) => (
                                                <div
                                                    key={student._id}
                                                    className={`student-card ${teamData.selectedStudents.includes(student._id) ? 'selected' : ''}`}
                                                    onClick={() => handleStudentToggle(student._id)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={teamData.selectedStudents.includes(student._id)}
                                                        onChange={() => handleStudentToggle(student._id)}
                                                    />
                                                    <div className="student-info">
                                                        <strong>{student.name}</strong>
                                                        <span className="text-muted">{student.email}</span>
                                                        <span className="text-muted">{student.department}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setShowCreateTeam(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create Team
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Pending BOM Requests */}
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

                {/* All BOM Requests */}
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
