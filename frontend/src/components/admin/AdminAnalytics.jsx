import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import {
    TrendingUp,
    Leaf,
    Zap,
    Package,
    Calendar,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [environmental, setEnvironmental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
    });
    const [groupBy, setGroupBy] = useState('month');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange, groupBy]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);
            params.append('groupBy', groupBy);

            const [consumptionRes, environmentalRes] = await Promise.all([
                api.get(`/admin/analytics/consumption?${params}`),
                api.get(`/admin/analytics/environmental?${params}`),
            ]);

            setAnalytics(consumptionRes.data.analytics);
            setEnvironmental(environmentalRes.data.environmental);
        } catch (err) {
            setError('Failed to fetch analytics data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toFixed(2) || '0';
    };

    // Sample data if no real data available
    const sampleConsumptionTrend = [
        { _id: '2025-07', totalQuantity: 150, totalCarbon: 45, totalEnergy: 230 },
        { _id: '2025-08', totalQuantity: 220, totalCarbon: 66, totalEnergy: 340 },
        { _id: '2025-09', totalQuantity: 180, totalCarbon: 54, totalEnergy: 280 },
        { _id: '2025-10', totalQuantity: 290, totalCarbon: 87, totalEnergy: 450 },
        { _id: '2025-11', totalQuantity: 250, totalCarbon: 75, totalEnergy: 390 },
        { _id: '2025-12', totalQuantity: 310, totalCarbon: 93, totalEnergy: 480 },
        { _id: '2026-01', totalQuantity: 280, totalCarbon: 84, totalEnergy: 430 },
    ];

    const sampleCategoryData = [
        { _id: 'metal', totalQuantity: 450, totalCarbon: 135 },
        { _id: 'plastic', totalQuantity: 320, totalCarbon: 96 },
        { _id: 'electronic', totalQuantity: 180, totalCarbon: 54 },
        { _id: 'composite', totalQuantity: 120, totalCarbon: 36 },
        { _id: 'chemical', totalQuantity: 80, totalCarbon: 24 },
    ];

    const sampleTopMaterials = [
        { name: 'Aluminum Sheet', totalQuantity: 120, totalCarbon: 36, category: 'metal' },
        { name: 'ABS Plastic', totalQuantity: 95, totalCarbon: 28.5, category: 'plastic' },
        { name: 'Steel Rod', totalQuantity: 85, totalCarbon: 25.5, category: 'metal' },
        { name: 'PCB Board', totalQuantity: 72, totalCarbon: 21.6, category: 'electronic' },
        { name: 'Carbon Fiber', totalQuantity: 45, totalCarbon: 13.5, category: 'composite' },
    ];

    const consumptionTrend = analytics?.consumptionTrend?.length > 0
        ? analytics.consumptionTrend
        : sampleConsumptionTrend;

    const consumptionByCategory = analytics?.consumptionByCategory?.length > 0
        ? analytics.consumptionByCategory
        : sampleCategoryData;

    const topMaterials = analytics?.topMaterials?.length > 0
        ? analytics.topMaterials
        : sampleTopMaterials;

    const environmentalTrend = environmental?.trend?.length > 0
        ? environmental.trend
        : sampleConsumptionTrend;

    const summary = environmental?.summary || {
        totalCarbon: 540,
        totalEnergy: 2600,
        totalConsumption: 1680,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-500">Material consumption and environmental impact insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                    >
                        <option value="day">Daily</option>
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                    </select>
                    <button
                        onClick={fetchAnalytics}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                        <TrendingUp className="w-6 h-6 opacity-60" />
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{formatNumber(summary.totalConsumption)}</h3>
                    <p className="text-emerald-100">Total Consumption (kg)</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Leaf className="w-6 h-6" />
                        </div>
                        <TrendingUp className="w-6 h-6 opacity-60" />
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{formatNumber(summary.totalCarbon)}</h3>
                    <p className="text-amber-100">Carbon Emission (kgCO₂)</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6" />
                        </div>
                        <TrendingUp className="w-6 h-6 opacity-60" />
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{formatNumber(summary.totalEnergy)}</h3>
                    <p className="text-blue-100">Energy Consumed (MJ)</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Consumption Trend */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Material Consumption Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={consumptionTrend}>
                            <defs>
                                <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="totalQuantity"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorQuantity)"
                                name="Quantity (kg)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Environmental Impact */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Environmental Impact Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={environmentalTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="totalCarbon"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                                name="Carbon (kgCO₂)"
                            />
                            <Line
                                type="monotone"
                                dataKey="totalEnergy"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                                name="Energy (MJ)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consumption by Category */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Consumption by Category</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={consumptionByCategory}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="totalQuantity"
                                nameKey="_id"
                                label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                            >
                                {consumptionByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Materials */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Consumed Materials</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={topMaterials} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                stroke="#9ca3af"
                                fontSize={12}
                                tick={{ fill: '#374151' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="totalQuantity"
                                fill="#10b981"
                                radius={[0, 4, 4, 0]}
                                name="Quantity (kg)"
                            />
                            <Bar
                                dataKey="totalCarbon"
                                fill="#f59e0b"
                                radius={[0, 4, 4, 0]}
                                name="Carbon (kgCO₂)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Carbon Emissions by Category */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Carbon Emissions by Material Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={consumptionByCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                            }}
                        />
                        <Bar dataKey="totalCarbon" fill="#ef4444" radius={[8, 8, 0, 0]} name="Carbon Emission (kgCO₂)">
                            {consumptionByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Environmental Summary Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <h2 className="text-lg font-bold text-gray-900">Material Impact Summary</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Material</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Quantity</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Carbon (kgCO₂)</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Impact Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topMaterials.map((material, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{material.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${material.category === 'metal' ? 'bg-slate-100 text-slate-700' :
                                                material.category === 'plastic' ? 'bg-blue-100 text-blue-700' :
                                                    material.category === 'electronic' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {material.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-600">{material.totalQuantity} kg</td>
                                    <td className="px-6 py-4 text-right text-gray-600">{material.totalCarbon}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${material.totalCarbon > 30 ? 'bg-red-500' :
                                                            material.totalCarbon > 20 ? 'bg-amber-500' :
                                                                'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min((material.totalCarbon / 50) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${material.totalCarbon > 30 ? 'text-red-600' :
                                                    material.totalCarbon > 20 ? 'text-amber-600' :
                                                        'text-emerald-600'
                                                }`}>
                                                {material.totalCarbon > 30 ? 'High' : material.totalCarbon > 20 ? 'Medium' : 'Low'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
