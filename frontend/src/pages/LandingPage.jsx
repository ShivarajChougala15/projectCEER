import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';
import { FaRocket, FaCog, FaUsers, FaChartLine } from 'react-icons/fa';

const LandingPage = () => {
    const { isAuthenticated, user } = useAuth();

    const getDashboardRoute = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'student':
                return '/student/dashboard';
            case 'faculty':
                return '/faculty/dashboard';
            case 'labincharge':
                return '/labincharge/dashboard';
            case 'admin':
                return '/admin/dashboard';
            default:
                return '/login';
        }
    };

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>

                <div className="container">
                    <div className="hero-content fade-in">
                        <h1 className="hero-title">
                            Welcome to <span className="text-gradient">Project CEER</span>
                        </h1>
                        <p className="hero-subtitle">
                            Exploration Lab Management System
                        </p>
                        <p className="hero-description">
                            Streamline your hardware project development with our comprehensive
                            Bill of Materials (BOM) management system. From request to approval,
                            manage your lab inventory efficiently.
                        </p>

                        <div className="hero-actions">
                            {isAuthenticated ? (
                                <Link to={getDashboardRoute()}>
                                    <button className="btn btn-primary btn-lg">
                                        Go to Dashboard
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/role-selection">
                                        <button className="btn btn-primary btn-lg">
                                            Get Started
                                        </button>
                                    </Link>
                                    <a href="#features">
                                        <button className="btn btn-outline btn-lg">
                                            Learn More
                                        </button>
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hero-image float">
                        <div className="image-card glass">
                            <img
                                src="/lab_equipment_hero.webp"
                                alt="Lab Equipment"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <div className="container">
                    <h2 className="section-title text-center">
                        <span className="text-gradient">Key Features</span>
                    </h2>

                    <div className="features-grid">
                        <div className="feature-card card fade-in">
                            <div className="feature-icon">
                                <FaRocket />
                            </div>
                            <h3>Easy BOM Creation</h3>
                            <p>
                                Students can quickly create and submit Bill of Materials for their
                                projects with detailed specifications.
                            </p>
                        </div>

                        <div className="feature-card card fade-in">
                            <div className="feature-icon">
                                <FaUsers />
                            </div>
                            <h3>Team Collaboration</h3>
                            <p>
                                Work together with your team members under faculty guidance to
                                build innovative hardware projects.
                            </p>
                        </div>

                        <div className="feature-card card fade-in">
                            <div className="feature-icon">
                                <FaCog />
                            </div>
                            <h3>Approval Workflow</h3>
                            <p>
                                Streamlined approval process from faculty guide to lab incharge
                                with email notifications at every step.
                            </p>
                        </div>

                        <div className="feature-card card fade-in">
                            <div className="feature-icon">
                                <FaChartLine />
                            </div>
                            <h3>Inventory Management</h3>
                            <p>
                                Lab incharge can efficiently manage inventory, track materials,
                                and ensure availability for all projects.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title text-center">
                        <span className="text-gradient">How It Works</span>
                    </h2>

                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Create BOM</h3>
                            <p>Students submit material requests with specifications</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Guide Review</h3>
                            <p>Faculty guide approves or modifies the request</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Lab Approval</h3>
                            <p>Lab incharge verifies inventory and approves</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step">
                            <div className="step-number">4</div>
                            <h3>Get Materials</h3>
                            <p>Collect approved materials and start building</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card glass">
                            <h3 className="stat-number text-gradient">500+</h3>
                            <p>Projects Completed</p>
                        </div>
                        <div className="stat-card glass">
                            <h3 className="stat-number text-gradient">1000+</h3>
                            <p>Active Students</p>
                        </div>
                        <div className="stat-card glass">
                            <h3 className="stat-number text-gradient">50+</h3>
                            <p>Faculty Guides</p>
                        </div>
                        <div className="stat-card glass">
                            <h3 className="stat-number text-gradient">99%</h3>
                            <p>Satisfaction Rate</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
