import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './FacultyDashboard.css';
import { FaClipboardList, FaUsers, FaEye, FaPlus, FaHome } from 'react-icons/fa';

const FacultyDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [boms, setBoms] = useState([]);
    const [teams, setTeams] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bomsRes, studentsRes, teamsRes] = await Promise.allSettled([
                api.get('/bom'),
                api.get('/users/available-students'),
                api.get('/teams')
            ]);

            if (bomsRes.status === 'fulfilled') {
                setBoms(bomsRes.value.data.boms);
            }

            if (studentsRes.status === 'fulfilled') {
                setAvailableStudents(studentsRes.value.data.students);
            }

            if (teamsRes.status === 'fulfilled') {
                setTeams(teamsRes.value.data.teams);
            }
        } catch (err) {
            setError('Failed to fetch data');
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
        <div className="faculty-dashboard-page">
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

            {/* Hero Section */}
            <div className="faculty-hero">
                <div className="hero-content">
                    <h1>Welcome, {user.name}!</h1>
                    <p>Manage your teams, review BOM requests, and guide your students</p>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="stat-number">{boms.filter(b => b.status === 'pending').length}</span>
                            <span className="stat-label">Pending BOMs</span>
                        </div>
                        <div className="hero-stat">
                            <span className="stat-number">{teams.length}</span>
                            <span className="stat-label">Active Teams</span>
                        </div>
                        <div className="hero-stat">
                            <span className="stat-number">{availableStudents.length}</span>
                            <span className="stat-label">Available Students</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="container">
                    <div className="alert alert-error">{error}</div>
                </div>
            )}

            {/* Feature Cards */}
            <div className="feature-cards-container">
                {/* BOM Management Card */}
                <div className="feature-card" onClick={() => navigate('/faculty/bom-management')}>
                    <div className="feature-card-header">
                        <div className="feature-icon bom-icon">
                            <FaClipboardList />
                        </div>
                        <h2>BOM Management</h2>
                        <p>Review and manage Bill of Materials requests</p>
                        {boms.filter(b => b.status === 'pending').length > 0 && (
                            <span className="notification-badge">{boms.filter(b => b.status === 'pending').length}</span>
                        )}
                    </div>
                </div>

                {/* Create Team Card */}
                <div className="feature-card" onClick={() => navigate('/faculty/create-team')}>
                    <div className="feature-card-header">
                        <div className="feature-icon create-icon">
                            <FaPlus />
                        </div>
                        <h2>Create Team</h2>
                        <p>Form new teams and assign students</p>
                    </div>
                </div>

                {/* View Teams Card */}
                <div className="feature-card" onClick={() => navigate('/faculty/view-teams')}>
                    <div className="feature-card-header">
                        <div className="feature-icon view-icon">
                            <FaEye />
                        </div>
                        <h2>View Teams</h2>
                        <p>See all teams you're guiding</p>
                        {teams.length > 0 && (
                            <span className="info-badge">{teams.length}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
