import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './StudentDashboard.css';
import { FaUsers, FaClipboardList, FaBox } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [boms, setBoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, teamsRes, bomsRes] = await Promise.all([
                api.get('/users'),
                api.get('/teams'),
                api.get('/bom'),
            ]);
            setUsers(usersRes.data.users);
            setTeams(teamsRes.data.teams);
            setBoms(bomsRes.data.boms);
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

    const stats = [
        {
            icon: <FaUsers />,
            label: 'Total Users',
            value: users.length,
            color: 'var(--accent-purple)',
        },
        {
            icon: <FaClipboardList />,
            label: 'Total BOMs',
            value: boms.length,
            color: 'var(--accent-blue)',
        },
        {
            icon: <FaBox />,
            label: 'Active Teams',
            value: teams.length,
            color: 'var(--accent-cyan)',
        },
    ];

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p className="text-muted">Welcome, {user.name}!</p>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="stats-grid">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="stat-card glass">
                            <div className="stat-icon" style={{ color: stat.color }}>
                                {stat.icon}
                            </div>
                            <h3 className="stat-number text-gradient">{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="admin-sections">
                    <div className="admin-section">
                        <h2>Recent Users</h2>
                        <div className="card">
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.slice(0, 5).map((u) => (
                                        <tr key={u._id}>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className="badge badge-info">{u.role}</span>
                                            </td>
                                            <td>{u.department || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="admin-section">
                        <h2>Recent Teams</h2>
                        <div className="card">
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>Team Name</th>
                                        <th>Project</th>
                                        <th>Members</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.slice(0, 5).map((team) => (
                                        <tr key={team._id}>
                                            <td>{team.teamName}</td>
                                            <td>{team.projectTitle}</td>
                                            <td>{team.members?.length || 0}</td>
                                            <td>
                                                <span className={`badge badge-${team.status === 'active' ? 'success' : 'warning'}`}>
                                                    {team.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="admin-section">
                        <h2>Recent BOMs</h2>
                        <div className="card">
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>Materials</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boms.slice(0, 5).map((bom) => (
                                        <tr key={bom._id}>
                                            <td>{bom.team?.teamName || 'N/A'}</td>
                                            <td>{bom.materials?.length || 0} items</td>
                                            <td>
                                                <span className={`badge badge-${bom.status.includes('approved') ? 'success' : bom.status.includes('rejected') ? 'danger' : 'warning'}`}>
                                                    {bom.status}
                                                </span>
                                            </td>
                                            <td>{new Date(bom.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
