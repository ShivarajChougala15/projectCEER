import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle2,
    ArrowRight,
    Rocket,
    Users,
    Settings,
    BarChart3,
    ClipboardList,
    UserCheck,
    Package,
    Wrench
} from 'lucide-react';
import Button from '../components/Button';

const Hero = ({ isAuthenticated, dashboardRoute }) => {
    return (
        <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-[#fffcf5]">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2 space-y-8">
                    <h1 className="text-5xl md:text-7xl font-serif text-slate-900 leading-[1.1]">
                        Welcome to<br />
                        <span className="italic font-normal text-[#005d52]">CEER</span>
                    </h1>
                    <p className="text-2xl text-gray-700 font-medium">
                        Exploration Lab Management System
                    </p>
                    <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
                        Streamline your hardware project development with our comprehensive
                        Bill of Materials (BOM) management system. From request to approval,
                        manage your lab inventory efficiently.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        {isAuthenticated ? (
                            <Link to={dashboardRoute}>
                                <Button variant="primary" className="px-10 py-4 text-lg w-full sm:w-auto">Go to Dashboard</Button>
                            </Link>
                        ) : (
                            <Link to="/role-selection">
                                <Button variant="primary" className="px-10 py-4 text-lg w-full sm:w-auto">Get Started</Button>
                            </Link>
                        )}
                        <a href="#features">
                            <Button variant="secondary" className="px-10 py-4 text-lg flex items-center justify-center gap-2 w-full sm:w-auto">
                                Learn More <ArrowRight size={18} />
                            </Button>
                        </a>
                    </div>
                </div>
                <div className="lg:w-1/2 relative">
                    <div className="bg-[#e8f3f1] rounded-[2rem] p-4 relative overflow-hidden aspect-square flex items-center justify-center">
                        <img
                            src="/lab_equipment_hero.webp"
                            alt="Lab Equipment"
                            className="rounded-2xl object-cover w-full h-full shadow-2xl"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800';
                            }}
                        />
                        {/* Floating UI Elements */}
                        <div className="absolute top-10 -right-4 bg-white p-4 rounded-xl shadow-lg border animate-bounce-slow">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">BOM Approved</p>
                                    <p className="font-bold text-slate-900">Ready to Build!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const LogoCloud = () => {
    return (
        <section className="py-16 border-y border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-8">
                <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-10">Trusted by KLE Technological University</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60">
                    <div className="text-2xl font-bold text-slate-500">School of ECE</div>
                    <div className="text-2xl font-bold text-slate-500">School of CS</div>
                    <div className="text-2xl font-bold text-slate-500">School of Mech</div>
                    <div className="text-2xl font-bold text-slate-500">Exploration Lab</div>
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#005d52] transition-all duration-300 group">
            <div className="w-14 h-14 bg-emerald-50 text-[#005d52] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#005d52] group-hover:text-white transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
};

const FeaturesSection = () => {
    const features = [
        {
            icon: <Rocket size={28} />,
            title: 'Easy BOM Creation',
            description: 'Students can quickly create and submit Bill of Materials for their projects with detailed specifications.'
        },
        {
            icon: <Users size={28} />,
            title: 'Team Collaboration',
            description: 'Work together with your team members under faculty guidance to build innovative hardware projects.'
        },
        {
            icon: <Settings size={28} />,
            title: 'Approval Workflow',
            description: 'Streamlined approval process from faculty guide to lab incharge with email notifications at every step.'
        },
        {
            icon: <BarChart3 size={28} />,
            title: 'Inventory Management',
            description: 'Lab incharge can efficiently manage inventory, track materials, and ensure availability for all projects.'
        }
    ];

    return (
        <section id="features" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold tracking-wide mb-4">
                        Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
                        Key Features
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <FeatureCard key={idx} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const HowItWorks = () => {
    const steps = [
        { number: '1', icon: <ClipboardList size={24} />, title: 'Create BOM', description: 'Students submit material requests with specifications' },
        { number: '2', icon: <UserCheck size={24} />, title: 'Guide Review', description: 'Faculty guide approves or modifies the request' },
        { number: '3', icon: <Package size={24} />, title: 'Lab Approval', description: 'Lab incharge verifies inventory and approves' },
        { number: '4', icon: <Wrench size={24} />, title: 'Get Materials', description: 'Collect approved materials and start building' },
    ];

    return (
        <section className="py-24 bg-[#005d52] text-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                        How It Works
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative">
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-white/30">
                                    <span className="text-3xl font-bold">{step.number}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-emerald-100">{step.description}</p>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/4 -right-4 text-white/50">
                                    <ArrowRight size={32} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const StatsGrid = () => {
    const stats = [
        { value: '500+', label: 'Projects Completed' },
        { value: '1000+', label: 'Active Students' },
        { value: '50+', label: 'Faculty Guides' },
        { value: '99%', label: 'Satisfaction Rate' },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow">
                            <p className="text-5xl font-serif text-[#005d52] mb-2">{stat.value}</p>
                            <p className="text-gray-600 font-medium text-sm uppercase tracking-wide">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CTASection = ({ isAuthenticated, dashboardRoute }) => {
    return (
        <section className="py-24 bg-[#fffcf5]">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
                <h2 className="text-4xl md:text-6xl font-serif text-slate-900">Ready to start your project?</h2>
                <p className="text-xl text-gray-600">Join KLE Tech students and faculty in building innovative hardware projects with our streamlined BOM management system.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {isAuthenticated ? (
                        <Link to={dashboardRoute}>
                            <Button className="px-12 py-5 text-xl">Go to Dashboard</Button>
                        </Link>
                    ) : (
                        <Link to="/role-selection">
                            <Button className="px-12 py-5 text-xl">Get Started Now</Button>
                        </Link>
                    )}
                    <a href="#features">
                        <Button variant="secondary" className="px-12 py-5 text-xl">Learn More</Button>
                    </a>
                </div>
            </div>
        </section>
    );
};

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

    const dashboardRoute = getDashboardRoute();

    return (
        <div className="landing-page font-sans text-slate-900">
            <Hero isAuthenticated={isAuthenticated} dashboardRoute={dashboardRoute} />
            <LogoCloud />
            <FeaturesSection />
            <HowItWorks />
            <StatsGrid />
            <CTASection isAuthenticated={isAuthenticated} dashboardRoute={dashboardRoute} />
        </div>
    );
};

export default LandingPage;
