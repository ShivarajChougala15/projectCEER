import React from 'react';

const Footer = () => {
    const columns = [
        { title: 'Product', links: ['Features', 'BOM Management', 'Integrations', 'Apps'] },
        { title: 'Resources', links: ['Knowledge Base', 'CEER Blog', 'Community', 'Training'] },
        { title: 'University', links: ['About KLE Tech', 'Exploration Lab', 'Partner program', 'Guidelines'] },
        { title: 'Support', links: ['Help center', 'Contact us', 'Service status', 'Security'] },
    ];

    return (
        <footer className="bg-white pt-24 pb-12 border-t font-sans">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-[#005d52] rounded flex items-center justify-center">
                                <span className="text-white font-bold">C</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">CEER</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">
                            Exploration Lab Management System for KLE Technological University.
                        </p>
                    </div>
                    {columns.map((col) => (
                        <div key={col.title}>
                            <h4 className="font-bold text-slate-900 mb-6">{col.title}</h4>
                            <ul className="space-y-4">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-gray-500 hover:text-[#005d52] transition-colors no-underline">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-gray-400 text-sm">© 2026 CEER, KLE Tech. All rights reserved.</p>
                    <div className="flex gap-8 text-sm text-gray-400">
                        <a href="#" className="hover:underline text-gray-400">Privacy Policy</a>
                        <a href="#" className="hover:underline text-gray-400">Terms of Service</a>
                        <a href="#" className="hover:underline text-gray-400">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
