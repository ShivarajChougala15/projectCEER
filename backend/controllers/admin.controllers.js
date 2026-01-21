import User from '../models/user.models.js';
import Team from '../models/team.models.js';
import BOM from '../models/bom.models.js';
import Material from '../models/material.models.js';
import Equipment from '../models/equipment.models.js';
import MaterialConsumption from '../models/materialConsumption.models.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalStudents,
            totalFaculty,
            totalLabIncharge,
            totalTeams,
            activeTeams,
            totalBoms,
            pendingBoms,
            totalMaterials,
            totalEquipment,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'faculty' }),
            User.countDocuments({ role: 'labincharge' }),
            Team.countDocuments(),
            Team.countDocuments({ status: 'active' }),
            BOM.countDocuments(),
            BOM.countDocuments({ status: { $in: ['submitted', 'guide_approved'] } }),
            Material.countDocuments(),
            Equipment.countDocuments(),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    faculty: totalFaculty,
                    labIncharge: totalLabIncharge,
                },
                teams: {
                    total: totalTeams,
                    active: activeTeams,
                },
                boms: {
                    total: totalBoms,
                    pending: pendingBoms,
                },
                resources: {
                    materials: totalMaterials,
                    equipment: totalEquipment,
                },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get staff directory (Faculty and Lab Incharges with their teams)
// @route   GET /api/admin/staff-directory
// @access  Private (Admin)
export const getStaffDirectory = async (req, res) => {
    try {
        const faculty = await User.find({ role: 'faculty' })
            .select('-password')
            .lean();

        const labIncharges = await User.find({ role: 'labincharge' })
            .select('-password')
            .lean();

        // Get teams for each faculty member (as guide)
        const facultyWithTeams = await Promise.all(
            faculty.map(async (f) => {
                const teams = await Team.find({ guide: f._id })
                    .populate('members', 'name email')
                    .lean();
                return { ...f, teams };
            })
        );

        res.status(200).json({
            success: true,
            staffDirectory: {
                faculty: facultyWithTeams,
                labIncharges,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Bulk register users from CSV
// @route   POST /api/admin/bulk-register
// @access  Private (Admin)
export const bulkRegisterUsers = async (req, res) => {
    try {
        if (!req.body.users || !Array.isArray(req.body.users)) {
            return res.status(400).json({ message: 'Please provide an array of users' });
        }

        const users = req.body.users;
        const results = {
            success: [],
            failed: [],
        };

        for (const userData of users) {
            try {
                const existing = await User.findOne({ email: userData.email });
                if (existing) {
                    results.failed.push({
                        email: userData.email,
                        reason: 'User already exists',
                    });
                    continue;
                }

                // Set default password based on role
                const defaultPassword = `${userData.role || 'student'}@123`;

                const user = await User.create({
                    name: userData.name,
                    email: userData.email,
                    password: defaultPassword,
                    role: userData.role || 'student',
                    department: userData.department,
                });

                results.success.push({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    defaultPassword,
                });
            } catch (err) {
                results.failed.push({
                    email: userData.email,
                    reason: err.message,
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Registered ${results.success.length} users, ${results.failed.length} failed`,
            results,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get analytics data for material consumption
// @route   GET /api/admin/analytics/consumption
// @access  Private (Admin)
export const getConsumptionAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'month' } = req.query;

        const matchStage = {};
        if (startDate || endDate) {
            matchStage.consumedAt = {};
            if (startDate) matchStage.consumedAt.$gte = new Date(startDate);
            if (endDate) matchStage.consumedAt.$lte = new Date(endDate);
        }

        let dateFormat;
        switch (groupBy) {
            case 'day':
                dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$consumedAt' } };
                break;
            case 'week':
                dateFormat = { $week: '$consumedAt' };
                break;
            case 'month':
            default:
                dateFormat = { $dateToString: { format: '%Y-%m', date: '$consumedAt' } };
                break;
        }

        const consumptionTrend = await MaterialConsumption.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: dateFormat,
                    totalQuantity: { $sum: '$quantity' },
                    totalCarbon: { $sum: '$carbonEmission' },
                    totalEnergy: { $sum: '$energyConsumed' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Get consumption by material category
        const consumptionByCategory = await MaterialConsumption.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'materials',
                    localField: 'material',
                    foreignField: '_id',
                    as: 'materialInfo',
                },
            },
            { $unwind: '$materialInfo' },
            {
                $group: {
                    _id: '$materialInfo.category',
                    totalQuantity: { $sum: '$quantity' },
                    totalCarbon: { $sum: '$carbonEmission' },
                    totalEnergy: { $sum: '$energyConsumed' },
                },
            },
        ]);

        // Get top consumed materials
        const topMaterials = await MaterialConsumption.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$material',
                    totalQuantity: { $sum: '$quantity' },
                    totalCarbon: { $sum: '$carbonEmission' },
                    totalEnergy: { $sum: '$energyConsumed' },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'materials',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'materialInfo',
                },
            },
            { $unwind: '$materialInfo' },
            {
                $project: {
                    name: '$materialInfo.name',
                    category: '$materialInfo.category',
                    totalQuantity: 1,
                    totalCarbon: 1,
                    totalEnergy: 1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            analytics: {
                consumptionTrend,
                consumptionByCategory,
                topMaterials,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get environmental impact data
// @route   GET /api/admin/analytics/environmental
// @access  Private (Admin)
export const getEnvironmentalImpact = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = {};
        if (startDate || endDate) {
            matchStage.consumedAt = {};
            if (startDate) matchStage.consumedAt.$gte = new Date(startDate);
            if (endDate) matchStage.consumedAt.$lte = new Date(endDate);
        }

        // Monthly environmental impact trend
        const impactTrend = await MaterialConsumption.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$consumedAt' } },
                    totalCarbon: { $sum: '$carbonEmission' },
                    totalEnergy: { $sum: '$energyConsumed' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Total impact summary
        const totalImpact = await MaterialConsumption.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalCarbon: { $sum: '$carbonEmission' },
                    totalEnergy: { $sum: '$energyConsumed' },
                    totalConsumption: { $sum: '$quantity' },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            environmental: {
                trend: impactTrend,
                summary: totalImpact[0] || { totalCarbon: 0, totalEnergy: 0, totalConsumption: 0 },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
