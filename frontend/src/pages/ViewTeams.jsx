import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaArrowLeft, FaUsers, FaHome } from 'react-icons/fa';
import './FacultyPages.css';

const ViewTeams = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const { data } = await api.get('/teams');
            setTeams(data.teams);
        } catch (err) {
            setError('Failed to fetch teams');
        } finally {
            setLoading(false);
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
                <h1>View Teams</h1>
                <p>All teams you're currently guiding</p>
            </div>

            <div className="page-content">
                {error && <div className="alert alert-error">{error}</div>}

                {teams.length === 0 ? (
                    <div className="empty-state">
                        <FaUsers style={{ fontSize: '4rem', color: '#cbd5e0', marginBottom: '1rem' }} />
                        <p>No teams found. Create your first team!</p>
                        <button className="btn btn-primary" onClick={() => navigate('/faculty/create-team')}>
                            Create Team
                        </button>
                    </div>
                ) : (
                    <div className="teams-grid">
                        {teams.map((team) => (
                            <div key={team._id} className="team-card">
                                <div className="team-header">
                                    <h3>{team.teamName}</h3>
                                    <span className="team-badge">
                                        <FaUsers /> {team.members?.length || 0} Members
                                    </span>
                                </div>

                                {team.projectTitle && (
                                    <div className="team-project">
                                        <strong>Problem Statement:</strong>
                                        <p>{team.projectTitle}</p>
                                    </div>
                                )}

                                {team.projectDescription && (
                                    <div className="team-description">
                                        <strong>Description:</strong>
                                        <p>{team.projectDescription}</p>
                                    </div>
                                )}

                                <div className="team-members">
                                    <strong>Team Members:</strong>
                                    <ul>
                                        {team.members?.map((member) => (
                                            <li key={member._id}>
                                                <div className="member-info">
                                                    <span className="member-name">{member.name}</span>
                                                    <span className="member-email">{member.email}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="team-meta">
                                    <span>Created: {new Date(team.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewTeams;
