import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaArrowLeft, FaPlus, FaHome } from 'react-icons/fa';
import './FacultyPages.css';

const CreateTeam = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [availableStudents, setAvailableStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [teamData, setTeamData] = useState({
        teamName: '',
        problemStatement: '',
        selectedStudents: []
    });

    useEffect(() => {
        fetchAvailableStudents();
    }, []);

    const fetchAvailableStudents = async () => {
        try {
            const { data } = await api.get('/users/available-students');
            setAvailableStudents(data.students);
        } catch (err) {
            setError('Failed to fetch available students');
        } finally {
            setLoading(false);
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
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (!teamData.problemStatement.trim()) {
            setError('Please enter a problem statement');
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (teamData.selectedStudents.length === 0) {
            setError('Please select at least one student');
            setTimeout(() => setError(''), 3000);
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

            setSuccess('Team created successfully! Redirecting...');
            setTimeout(() => {
                navigate('/faculty/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create team');
            setTimeout(() => setError(''), 3000);
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
                <h1>Create Team</h1>
                <p>Form new teams and assign students to projects</p>
            </div>

            <div className="page-content">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleCreateTeam} className="team-form">
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
                            rows="5"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Select Students * ({teamData.selectedStudents.length} selected)</label>
                        {availableStudents.length === 0 ? (
                            <div className="empty-state">
                                <p>No available students. All students are already assigned to teams.</p>
                            </div>
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
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/faculty/dashboard')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <FaPlus /> Create Team
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTeam;
