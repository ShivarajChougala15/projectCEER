import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';
import { FaUserGraduate, FaChalkboardTeacher, FaFlask, FaUserShield } from 'react-icons/fa';

const RoleSelection = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('');

    const roles = [
        {
            id: 'student',
            name: 'Student',
            icon: <FaUserGraduate />,
            description: 'Create and manage BOM requests for your projects',
            color: 'var(--accent-blue)',
        },
        {
            id: 'faculty',
            name: 'Faculty',
            icon: <FaChalkboardTeacher />,
            description: 'Review and approve student BOM requests',
            color: 'var(--accent-purple)',
        },
        {
            id: 'labincharge',
            name: 'Lab Incharge',
            icon: <FaFlask />,
            description: 'Manage inventory and approve material requests',
            color: 'var(--accent-cyan)',
        },
        {
            id: 'admin',
            name: 'Admin',
            icon: <FaUserShield />,
            description: 'Full system control and user management',
            color: 'var(--accent-pink)',
        },
    ];

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        navigate(`/login?role=${roleId}`);
    };

    return (
        <div className="role-selection-page">
            <div className="container">
                <div className="role-selection-content">
                    <h1 className="text-gradient text-center">Select Your Role</h1>
                    <p className="text-center text-muted mb-3">
                        Choose your role to continue to the login page
                    </p>

                    <div className="roles-grid">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="role-card card fade-in"
                                onClick={() => handleRoleSelect(role.id)}
                            >
                                <div className="role-icon" style={{ color: role.color }}>
                                    {role.icon}
                                </div>
                                <h3>{role.name}</h3>
                                <p>{role.description}</p>
                                <button className="btn btn-primary">
                                    Continue as {role.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
