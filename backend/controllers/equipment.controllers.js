import Equipment from '../models/equipment.models.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
export const getEquipment = async (req, res) => {
    try {
        const { category, status, search } = req.query;

        let filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const equipment = await Equipment.find(filter)
            .populate('lastUpdatedBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort('name');

        res.status(200).json({
            success: true,
            count: equipment.length,
            equipment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
export const getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id)
            .populate('lastUpdatedBy', 'name email')
            .populate('assignedTo', 'name email');

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.status(200).json({
            success: true,
            equipment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create equipment
// @route   POST /api/equipment
// @access  Private (Admin)
export const createEquipment = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            model,
            manufacturer,
            serialNumber,
            location,
            status,
            purchaseDate,
            purchasePrice,
            warrantyExpiry,
            specifications,
        } = req.body;

        // Check if equipment already exists
        const equipmentExists = await Equipment.findOne({ name });
        if (equipmentExists) {
            return res.status(400).json({ message: 'Equipment with this name already exists' });
        }

        let imageUrl = null;
        let imagePublicId = null;

        // Handle image upload if provided
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'equipment' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }

        const equipment = await Equipment.create({
            name,
            description,
            category,
            model,
            manufacturer,
            serialNumber,
            location,
            status,
            purchaseDate,
            purchasePrice,
            warrantyExpiry,
            specifications: specifications ? new Map(Object.entries(specifications)) : undefined,
            imageUrl,
            imagePublicId,
            lastUpdatedBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Equipment created successfully',
            equipment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private (Admin)
export const updateEquipment = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            model,
            manufacturer,
            serialNumber,
            location,
            status,
            purchaseDate,
            purchasePrice,
            warrantyExpiry,
            lastMaintenanceDate,
            nextMaintenanceDate,
            specifications,
            assignedTo,
        } = req.body;

        const equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        // Handle image upload if provided
        if (req.file) {
            // Delete old image if exists
            if (equipment.imagePublicId) {
                await cloudinary.uploader.destroy(equipment.imagePublicId);
            }

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'equipment' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            equipment.imageUrl = result.secure_url;
            equipment.imagePublicId = result.public_id;
        }

        equipment.name = name || equipment.name;
        equipment.description = description || equipment.description;
        equipment.category = category || equipment.category;
        equipment.model = model || equipment.model;
        equipment.manufacturer = manufacturer || equipment.manufacturer;
        equipment.serialNumber = serialNumber || equipment.serialNumber;
        equipment.location = location || equipment.location;
        equipment.status = status || equipment.status;
        equipment.purchaseDate = purchaseDate || equipment.purchaseDate;
        equipment.purchasePrice = purchasePrice !== undefined ? purchasePrice : equipment.purchasePrice;
        equipment.warrantyExpiry = warrantyExpiry || equipment.warrantyExpiry;
        equipment.lastMaintenanceDate = lastMaintenanceDate || equipment.lastMaintenanceDate;
        equipment.nextMaintenanceDate = nextMaintenanceDate || equipment.nextMaintenanceDate;
        equipment.assignedTo = assignedTo || equipment.assignedTo;
        equipment.lastUpdatedBy = req.user._id;

        if (specifications) {
            equipment.specifications = new Map(Object.entries(specifications));
        }

        await equipment.save();

        res.status(200).json({
            success: true,
            message: 'Equipment updated successfully',
            equipment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private (Admin)
export const deleteEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        // Delete image from cloudinary if exists
        if (equipment.imagePublicId) {
            await cloudinary.uploader.destroy(equipment.imagePublicId);
        }

        await equipment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Equipment deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Bulk import equipment from CSV/JSON
// @route   POST /api/equipment/bulk-import
// @access  Private (Admin)
export const bulkImportEquipment = async (req, res) => {
    try {
        if (!req.body.equipment || !Array.isArray(req.body.equipment)) {
            return res.status(400).json({ message: 'Please provide an array of equipment' });
        }

        const equipmentData = req.body.equipment;
        const results = {
            success: [],
            failed: [],
        };

        for (const item of equipmentData) {
            try {
                const existing = await Equipment.findOne({ name: item.name });
                if (existing) {
                    results.failed.push({
                        name: item.name,
                        reason: 'Equipment already exists',
                    });
                    continue;
                }

                const equipment = await Equipment.create({
                    ...item,
                    specifications: item.specifications ? new Map(Object.entries(item.specifications)) : undefined,
                    lastUpdatedBy: req.user._id,
                });
                results.success.push(equipment);
            } catch (err) {
                results.failed.push({
                    name: item.name,
                    reason: err.message,
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Imported ${results.success.length} equipment items, ${results.failed.length} failed`,
            results,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update equipment status
// @route   PUT /api/equipment/:id/status
// @access  Private (Admin, Lab Incharge)
export const updateEquipmentStatus = async (req, res) => {
    try {
        const { status, assignedTo } = req.body;

        const equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        equipment.status = status || equipment.status;
        equipment.assignedTo = assignedTo;
        equipment.lastUpdatedBy = req.user._id;

        await equipment.save();

        res.status(200).json({
            success: true,
            message: 'Equipment status updated successfully',
            equipment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
