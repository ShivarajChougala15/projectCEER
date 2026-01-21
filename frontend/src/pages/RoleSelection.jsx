import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, FlaskConical, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';

const RoleSelection = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('');

    const roles = [
        {
            id: 'student',
            name: 'Student',
            icon: <GraduationCap size={40} />,
            description: 'Create and manage BOM requests for your projects',
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
        },
        {
            id: 'faculty',
            name: 'Faculty',
            icon: <BookOpen size={40} />,
            description: 'Review and approve student BOM requests',
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
        },
        {
            id: 'labincharge',
            name: 'Lab Incharge',
            icon: <FlaskConical size={40} />,
            description: 'Manage inventory and approve material requests',
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-50',
        },
        {
            id: 'admin',
            name: 'Admin',
            icon: <ShieldCheck size={40} />,
            description: 'Full system control and user management',
            color: 'text-pink-500',
            bgColor: 'bg-pink-50',
        },
    ];

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        navigate(`/login?role=${roleId}`);
    };

    return (
        <div className="min-h-screen bg-[#fffcf5] flex items-center justify-center px-4 py-12 pt-28">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
                        Select Your Role
                    </h1>
                    <p className="text-gray-500 text-lg">
                        Choose your role to continue to the login page
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="bg-white p-8 border border-gray-200 cursor-pointer shadow-sm"
                            style={{ borderRadius: '10px' }}
                            onClick={() => handleRoleSelect(role.id)}
                        >
                            <div
                                className={`w-20 h-20 ${role.bgColor} ${role.color} flex items-center justify-center mx-auto mb-6`}
                                style={{ borderRadius: '10px' }}
                            >
                                {role.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 text-center mb-3">
                                {role.name}
                            </h3>
                            <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
                                {role.description}
                            </p>
                            <Button variant="primary" className="w-full" style={{ borderRadius: '10px' }}>
                                Continue as {role.name}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
