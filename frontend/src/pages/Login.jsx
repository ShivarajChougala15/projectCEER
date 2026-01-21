import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

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
        <div className="min-h-screen bg-[#fffcf5] flex items-center justify-center px-4 py-12 pt-28">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-500">Sign in to continue to CEER</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005d52] focus:border-transparent transition-all"
                            >
                                <option value="">Select your role</option>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="labincharge">Lab Incharge</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="yourname@kletech.ac.in"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005d52] focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Must end with @kletech.ac.in</p>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005d52] focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Default password: {formData.role ? `${formData.role}@123` : 'role@123'}
                            </p>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="w-full py-4 text-lg"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm mb-4">
                            Don't have an account? Contact admin for registration.
                        </p>
                        <Link to="/role-selection">
                            <Button variant="secondary" className="w-full">
                                Change Role
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
