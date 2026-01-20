import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: searchParams.get('role') || '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            const dashboardRoutes = {
                student: '/student/dashboard',
                faculty: '/faculty/dashboard',
                labincharge: '/labincharge/dashboard',
                admin: '/admin/dashboard',
            };
            navigate(dashboardRoutes[user.role] || '/');
        }
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate email domain
        if (!formData.email.endsWith('@kletech.ac.in')) {
            setError('Email must end with @kletech.ac.in');
            setLoading(false);
            return;
        }

        if (!formData.role) {
            setError('Please select a role');
            setLoading(false);
            return;
        }

        try {
            await login(formData.email, formData.password, formData.role);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card glass">
                    <div className="login-header">
                        <h1 className="text-gradient">Welcome Back</h1>
                        <p className="text-muted">Sign in to continue to Project CEER</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select your role</option>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="labincharge">Lab Incharge</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="yourname@kletech.ac.in"
                                required
                            />
                            <small className="text-muted">Must end with @kletech.ac.in</small>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                            <small className="text-muted">
                                Default password: {formData.role ? `${formData.role}@123` : 'role@123'}
                            </small>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p className="text-muted">
                            Don't have an account? Contact admin for registration.
                        </p>
                        <Link to="/role-selection" className="text-center">
                            <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }}>
                                Change Role
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
