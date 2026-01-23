import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaPlus, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [boms, setBoms] = useState([]);
    const [materialsDatabase, setMaterialsDatabase] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal state
    const [modalData, setModalData] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Scroll ref
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [bomsRes, materialsRes, equipmentRes, teamRes] = await Promise.allSettled([
                api.get('/bom'),
                api.get('/materials'),
                api.get('/equipment'),
                api.get('/teams/my-team'),
            ]);

            if (bomsRes.status === 'fulfilled') {
                setBoms(bomsRes.value.data.boms);
            }

            if (materialsRes.status === 'fulfilled') {
                // Show ALL materials from admin's material database
                setMaterialsDatabase(materialsRes.value.data.materials || materialsRes.value.data);
            }

            if (equipmentRes.status === 'fulfilled') {
                // Show ALL equipment from admin's equipment section
                setEquipment(equipmentRes.value.data.equipment || equipmentRes.value.data);
            }

            if (teamRes.status === 'fulfilled') {
                setTeam(teamRes.value.data.team);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBOMs = async () => {
        try {
            const { data } = await api.get('/bom');
            setBoms(data.boms);
        } catch (err) {
            setError('Failed to fetch BOMs');
        }
    };

    const openModal = (item, type) => {
        setModalData({ ...item, type });
        setShowModal(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setShowModal(false);
        setModalData(null);
        document.body.style.overflow = 'auto';
    };

    const scrollMaterials = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -320 : 320;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const filteredMaterials = materialsDatabase.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusBadge = (status) => {
        const statusStyles = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            'guide-approved': 'bg-blue-50 text-blue-700 border-blue-200',
            'guide-rejected': 'bg-red-50 text-red-700 border-red-200',
            'labincharge-approved': 'bg-green-50 text-green-700 border-green-200',
            'labincharge-rejected': 'bg-red-50 text-red-700 border-red-200',
            completed: 'bg-green-50 text-green-700 border-green-200',
        };

        const statusText = {
            pending: 'Pending',
            'guide-approved': 'Guide Approved',
            'guide-rejected': 'Rejected',
            'labincharge-approved': 'Approved',
            'labincharge-rejected': 'Rejected',
            completed: 'Completed',
        };

        return (
            <span className={`text-[9px] uppercase tracking-widest px-3 py-1 border rounded-full ${statusStyles[status] || 'bg-stone-50 text-stone-700 border-stone-200'}`}>
                {statusText[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C8278]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfbf9] antialiased">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 bg-transparent absolute w-full z-10 text-white">
                <div className="text-xl font-semibold tracking-tighter underline decoration-white/30 underline-offset-8">
                    CEER.LAB
                </div>
                <div className="hidden md:flex space-x-8 text-[10px] uppercase tracking-[0.3em] font-medium opacity-80">
                    <a href="#" className="hover:opacity-100 transition-opacity">Dashboard</a>
                    <a href="#materials" className="hover:opacity-100 transition-opacity">Materials</a>
                    <a href="#equipment" className="hover:opacity-100 transition-opacity">Equipment</a>
                    <a href="#bom" className="hover:opacity-100 transition-opacity">BOM</a>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden md:block text-[10px] uppercase tracking-wider opacity-70">{user.name}</span>
                    <button
                        onClick={logout}
                        className="text-[10px] uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-[75vh] flex flex-col items-center justify-center overflow-hidden px-6 text-center text-white"
                style={{
                    backgroundColor: '#8C8278',
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")'
                }}>
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-black/5 rounded-full blur-2xl"></div>

                <div className="max-w-4xl relative z-10 animate-[fadeIn_1.2s_ease-out_forwards]">
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] font-medium opacity-70 mb-8 block">
                        Exploration Lab Management System
                    </span>
                    <h1 className="font-serif text-6xl md:text-9xl font-medium leading-[1.05] mb-8">
                        Design <br /> <span className="italic text-white/90">Intelligence</span>
                    </h1>
                    <div className="w-20 h-[1px] bg-white/30 mx-auto mb-10"></div>
                    <p className="max-w-md mx-auto text-sm md:text-base font-light leading-relaxed opacity-80 mb-12">
                        Managing material procurement and project development for innovative hardware solutions.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <a
                            href="#materials"
                            className="px-10 py-4 bg-white text-stone-800 text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm hover:bg-stone-100 transition-all duration-300"
                        >
                            View Materials
                        </a>
                        <a
                            href="#equipment"
                            className="px-10 py-4 bg-transparent border border-white/40 text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm hover:bg-white/10 transition-all duration-300"
                        >
                            View Equipment
                        </a>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto -mt-20 px-6 relative z-20">
                {/* Alerts */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-sm">
                        {success}
                    </div>
                )}

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white p-10 shadow-xl shadow-stone-200/40 rounded-sm border border-stone-100 flex flex-col items-start text-left transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl hover:border-[#8C8278]">
                        <h3 className="font-serif text-3xl mb-3 text-stone-800">BOM Requests</h3>
                        <p className="text-stone-400 text-[10px] mb-6 uppercase tracking-[0.2em] font-semibold">Bill of Materials</p>
                        <div className="text-4xl font-light text-stone-700 mb-6">
                            {boms.length} <span className="text-base opacity-40 italic">Total</span>
                        </div>
                        <button
                            onClick={() => navigate('/student/create-bom')}
                            className="mt-auto w-full py-3 bg-[#8C8278] text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm hover:bg-[#7a7268] transition-all duration-300"
                        >
                            Create New BOM
                        </button>
                    </div>

                    <div className="bg-white p-10 shadow-xl shadow-stone-200/40 rounded-sm border border-stone-100 flex flex-col items-start text-left transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl hover:border-[#8C8278] cursor-pointer">
                        <h3 className="font-serif text-3xl mb-3 text-stone-800">Materials</h3>
                        <p className="text-stone-400 text-[10px] mb-6 uppercase tracking-[0.2em] font-semibold">Material Database</p>
                        <div className="text-4xl font-light text-stone-700 mb-6">
                            {materialsDatabase.length} <span className="text-base opacity-40 uppercase tracking-tighter">Items</span>
                        </div>
                        <div className="mt-auto text-[10px] uppercase tracking-widest font-bold text-stone-400">Browse Database →</div>
                    </div>

                    <div className="bg-white p-10 shadow-xl shadow-stone-200/40 rounded-sm border border-stone-100 flex flex-col items-start text-left transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl hover:border-[#8C8278] cursor-pointer">
                        <h3 className="font-serif text-3xl mb-3 text-stone-800">Equipment</h3>
                        <p className="text-stone-400 text-[10px] mb-6 uppercase tracking-[0.2em] font-semibold">Lab Resources</p>
                        <div className="text-4xl font-light text-stone-700 mb-6">
                            {equipment.length} <span className="text-base opacity-40 uppercase tracking-tighter">Available</span>
                        </div>
                        <div className="mt-auto text-[10px] uppercase tracking-widest font-bold text-stone-400">View Equipment →</div>
                    </div>
                </div>


                {/* Material Database */}
                <div id="materials" className="mb-16 bg-white p-8 md:p-12 shadow-sm rounded-sm border border-stone-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                        <div>
                            <h2 className="font-serif text-4xl text-stone-800">Material Database</h2>
                            <p className="text-stone-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-semibold">
                                Explore {materialsDatabase.length} Available Resources
                            </p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search material by name..."
                                className="w-full px-6 py-4 bg-stone-50 border border-stone-200 text-sm font-light focus:outline-none focus:border-stone-400 transition-all italic rounded-sm"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-300">🔍</span>
                        </div>
                    </div>

                    <div className="max-h-[580px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#8C8278] scrollbar-track-stone-100">
                        {filteredMaterials.length === 0 ? (
                            <div className="text-center py-12 text-stone-400">
                                <p className="text-sm">No materials found</p>
                            </div>
                        ) : (
                            filteredMaterials.map((item) => (
                                <div
                                    key={item._id}
                                    onClick={() => openModal(item, 'material')}
                                    className="py-6 flex items-center gap-8 px-4 border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer"
                                >
                                    <div className="w-32 h-24 flex-shrink-0 overflow-hidden rounded-sm bg-stone-100 flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                className="w-full h-full object-cover"
                                                alt={item.name}
                                            />
                                        ) : (
                                            <span className="text-4xl">📦</span>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-serif text-2xl text-stone-800 hover:text-stone-500 transition-colors">
                                                {item.name}
                                            </h4>
                                            {item.category && (
                                                <span className="text-[9px] uppercase tracking-widest px-3 py-1 border border-stone-200 text-stone-400 rounded-full">
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-stone-500 text-xs font-light max-w-xl line-clamp-1">
                                            {item.description || 'Standard material for lab projects'}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0 hidden md:block">
                                        <span className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Stock</span>
                                        <span className="text-sm font-medium text-stone-800">{item.stockQuantity} {item.unit}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Equipment Section */}
                <div id="equipment" className="mb-16">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="font-serif text-4xl text-stone-800">Available Equipment</h2>
                            <p className="text-stone-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-semibold">Lab Resources</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => scrollMaterials('left')}
                                className="p-2 border border-stone-200 rounded-full hover:bg-stone-50 transition-colors"
                            >
                                <FaChevronLeft className="text-stone-600" />
                            </button>
                            <button
                                onClick={() => scrollMaterials('right')}
                                className="p-2 border border-stone-200 rounded-full hover:bg-stone-50 transition-colors"
                            >
                                <FaChevronRight className="text-stone-600" />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-8 pb-8 scrollbar-none snap-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {equipment.length === 0 ? (
                            <div className="w-full text-center py-12 text-stone-400">
                                <p className="text-sm">No equipment available</p>
                            </div>
                        ) : (
                            equipment.map((item) => (
                                <div
                                    key={item._id}
                                    onClick={() => openModal(item, 'equipment')}
                                    className="flex-none w-[280px] snap-start group cursor-pointer"
                                >
                                    <div className="h-[380px] w-full overflow-hidden rounded-sm mb-4 bg-stone-100 flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                alt={item.name}
                                            />
                                        ) : (
                                            <span className="text-6xl">🔧</span>
                                        )}
                                    </div>
                                    <h4 className="font-serif text-xl text-stone-800">{item.name}</h4>
                                    <p className="text-stone-400 text-[10px] uppercase tracking-widest font-medium">
                                        {item.category} / {item.status}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Team Information */}
                {team && (
                    <div className="bg-white p-10 md:p-12 shadow-xl shadow-stone-200/40 rounded-sm border border-stone-100 mb-16 transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                            <div className="md:w-1/2">
                                <h3 className="font-serif text-4xl mb-6 text-stone-800">Team Information</h3>
                                <p className="text-stone-400 text-[10px] mb-4 uppercase tracking-[0.2em] font-semibold">Project Scope</p>
                                <h4 className="text-stone-800 font-medium text-sm mb-2">Problem Statement</h4>
                                <p className="text-stone-500 text-sm leading-relaxed font-light">
                                    {team.projectTitle}
                                </p>
                                {team.projectDescription && (
                                    <p className="text-stone-400 text-xs leading-relaxed font-light mt-4">
                                        {team.projectDescription}
                                    </p>
                                )}
                            </div>

                            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-8 border-t md:border-t-0 md:border-l border-stone-100 pt-8 md:pt-0 md:pl-12">
                                <div>
                                    <p className="text-stone-400 text-[10px] mb-4 uppercase tracking-[0.2em] font-semibold">Academic Guide</p>
                                    <p className="font-serif text-xl text-stone-800 italic">{team.guide.name}</p>
                                    <p className="text-stone-400 text-[10px] mt-1 font-light tracking-wider">{team.guide.email}</p>
                                </div>
                                <div>
                                    <p className="text-stone-400 text-[10px] mb-4 uppercase tracking-[0.2em] font-semibold">Teammates</p>
                                    <ul className="text-stone-700 space-y-2 text-sm font-medium">
                                        {team.members.map((member) => (
                                            <li key={member._id} className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                                                {member.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Detail Modal */}
            {showModal && modalData && (
                <div
                    className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white max-w-2xl w-full rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="md:w-1/2 h-64 md:h-auto overflow-hidden bg-stone-100 flex items-center justify-center">
                            {modalData.type === 'equipment' && modalData.imageUrl ? (
                                <img
                                    src={modalData.imageUrl}
                                    className="w-full h-full object-cover"
                                    alt={modalData.name || modalData.materialName}
                                />
                            ) : (
                                <span className="text-8xl">{modalData.type === 'equipment' ? '🔧' : '📦'}</span>
                            )}
                        </div>
                        <div className="md:w-1/2 p-8 flex flex-col justify-center">
                            <button
                                onClick={closeModal}
                                className="self-end text-stone-400 hover:text-stone-800 text-xs tracking-widest uppercase mb-4"
                            >
                                Close ✕
                            </button>
                            <p className="text-stone-400 text-[10px] mb-2 uppercase tracking-[0.2em] font-semibold">
                                {modalData.category || modalData.type}
                            </p>
                            <h3 className="font-serif text-4xl mb-6 text-stone-800">
                                {modalData.name || modalData.materialName}
                            </h3>
                            <div className="space-y-4 text-sm text-stone-600 font-light leading-relaxed">
                                <p>{modalData.description || 'Standard lab resource'}</p>
                                <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-4">
                                    {modalData.type === 'material' ? (
                                        <>
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">
                                                    Stock Quantity
                                                </span>
                                                <span className="font-medium text-stone-800">
                                                    {modalData.stockQuantity} {modalData.unit}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">
                                                    Category
                                                </span>
                                                <span className="font-medium text-stone-800">
                                                    {modalData.category || 'General'}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">
                                                    Status
                                                </span>
                                                <span className="font-medium text-stone-800 capitalize">
                                                    {modalData.status}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">
                                                    Location
                                                </span>
                                                <span className="font-medium text-stone-800">
                                                    {modalData.location || 'Lab'}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }

                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }

                .scrollbar-thumb-\\[\\#8C8278\\]::-webkit-scrollbar-thumb {
                    background: #8C8278;
                    border-radius: 10px;
                }

                .scrollbar-track-stone-100::-webkit-scrollbar-track {
                    background: #f5f5f4;
                }
            `}</style>
        </div>
    );
};

export default StudentDashboard;
