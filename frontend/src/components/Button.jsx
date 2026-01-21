import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'bg-[#005d52] text-white hover:bg-[#004a41]',
        secondary: 'bg-white text-[#005d52] border-2 border-[#005d52] hover:bg-gray-50',
        ghost: 'text-gray-600 hover:text-black hover:bg-gray-100',
        black: 'bg-black text-white hover:bg-gray-800'
    };

    return (
        <button
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 text-sm md:text-base cursor-pointer ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
