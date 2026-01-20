import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav className="navbar glass">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <span className="text-gradient">Project CEER</span>
                    </Link>

                    <div className="navbar-actions">
                        {isAuthenticated ? (
                            <>
                                <span className="user-info">
                                    {user.name} <span className="badge badge-info">{user.role}</span>
                                </span>
                                <button onClick={logout} className="btn btn-outline">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login">
                                <button className="btn btn-primary">Login</button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
