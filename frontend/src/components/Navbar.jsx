import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Menu, X } from 'lucide-react';
import Button from './Button';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Products', hasDropdown: true },
        { name: 'Features', hasDropdown: true },
        { name: 'Pricing', hasDropdown: false },
        { name: 'Resources', hasDropdown: true },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-2 cursor-pointer no-underline">
                        <div className="w-8 h-8 bg-[#005d52] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">CEER</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <button key={link.name} className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-[#005d52] bg-transparent border-none cursor-pointer">
                                {link.name}
                                {link.hasDropdown && <ChevronDown size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <span className="text-sm font-medium text-gray-700">
                                {user.name} <span className="bg-gray-100 px-2 py-1 rounded text-xs">{user.role}</span>
                            </span>
                            <button onClick={handleLogout} className="text-sm font-medium text-gray-700 hover:text-black bg-transparent border-none cursor-pointer">
                                Log out
                            </button>
                            <Link to={
                                user.role === 'student' ? '/student/dashboard' :
                                    user.role === 'faculty' ? '/faculty/dashboard' :
                                        user.role === 'labincharge' ? '/labincharge/dashboard' :
                                            '/admin/dashboard'
                            }>
                                <Button variant="primary">Dashboard</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button className="text-sm font-medium text-gray-700 hover:text-black bg-transparent border-none cursor-pointer">
                                    Log in
                                </button>
                            </Link>
                            <Link to="/role-selection">
                                <Button variant="primary">Start</Button>
                            </Link>
                        </>
                    )}
                </div>

                <button className="lg:hidden bg-transparent border-none cursor-pointer text-slate-900" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex flex-col gap-6">
                        {navLinks.map((link) => (
                            <button key={link.name} className="flex justify-between items-center text-lg font-medium text-gray-800 bg-transparent border-none">
                                {link.name}
                                {link.hasDropdown && <ChevronDown size={18} />}
                            </button>
                        ))}
                        <hr className="border-gray-100" />

                        {isAuthenticated ? (
                            <>
                                <div className="text-lg font-medium text-gray-800">
                                    {user.name} ({user.role})
                                </div>
                                <Link to={
                                    user.role === 'student' ? '/student/dashboard' :
                                        user.role === 'faculty' ? '/faculty/dashboard' :
                                            user.role === 'labincharge' ? '/labincharge/dashboard' :
                                                '/admin/dashboard'
                                }>
                                    <Button variant="primary" className="w-full">Dashboard</Button>
                                </Link>
                                <button onClick={handleLogout} className="text-lg font-medium text-left text-gray-700 bg-transparent border-none">
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-lg font-medium text-gray-800 no-underline">
                                    Log in
                                </Link>
                                <Link to="/role-selection">
                                    <Button variant="primary" className="w-full">Start</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
