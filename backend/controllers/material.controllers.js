import Material from '../models/material.models.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
export const getMaterials = async (req, res) => {
    try {
        const { category, search } = req.query;

        let filter = {};
        if (category) filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const materials = await Material.find(filter)
            .populate('lastUpdatedBy', 'name email')
            .sort('name');

        res.status(200).json({
            success: true,
            count: materials.length,
            materials,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Private
export const getMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id)
            .populate('lastUpdatedBy', 'name email');

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        res.status(200).json({
            success: true,
            material,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create material
// @route   POST /api/materials
// @access  Private (Admin)
export const createMaterial = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            density,
            energyFactor,
            carbonFactor,
            unit,
            pricePerUnit,
            stockQuantity,
            supplier,
        } = req.body;

        // Check if material already exists
        const materialExists = await Material.findOne({ name });
        if (materialExists) {
            return res.status(400).json({ message: 'Material already exists' });
        }

        let imageUrl = null;
        let imagePublicId = null;

        // Handle image upload if provided
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'materials' },
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

        const material = await Material.create({
            name,
            description,
            category,
            density,
            energyFactor,
            carbonFactor,
            unit,
            pricePerUnit,
            stockQuantity,
            supplier,
            imageUrl,
            imagePublicId,
            lastUpdatedBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Material created successfully',
            material,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private (Admin)
export const updateMaterial = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            density,
            energyFactor,
            carbonFactor,
            unit,
            pricePerUnit,
            stockQuantity,
            supplier,
        } = req.body;

        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Handle image upload if provided
        if (req.file) {
            // Delete old image if exists
            if (material.imagePublicId) {
                await cloudinary.uploader.destroy(material.imagePublicId);
            }

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'materials' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            material.imageUrl = result.secure_url;
            material.imagePublicId = result.public_id;
        }

        material.name = name || material.name;
        material.description = description || material.description;
        material.category = category || material.category;
        material.density = density !== undefined ? density : material.density;
        material.energyFactor = energyFactor !== undefined ? energyFactor : material.energyFactor;
        material.carbonFactor = carbonFactor !== undefined ? carbonFactor : material.carbonFactor;
        material.unit = unit || material.unit;
        material.pricePerUnit = pricePerUnit !== undefined ? pricePerUnit : material.pricePerUnit;
        material.stockQuantity = stockQuantity !== undefined ? stockQuantity : material.stockQuantity;
        material.supplier = supplier || material.supplier;
        material.lastUpdatedBy = req.user._id;

        await material.save();

        res.status(200).json({
            success: true,
            message: 'Material updated successfully',
            material,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (Admin)
export const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Delete image from cloudinary if exists
        if (material.imagePublicId) {
            await cloudinary.uploader.destroy(material.imagePublicId);
        }

        await material.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Material deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Bulk import materials from CSV
// @route   POST /api/materials/bulk-import
// @access  Private (Admin)
export const bulkImportMaterials = async (req, res) => {
    try {
        if (!req.body.materials || !Array.isArray(req.body.materials)) {
            return res.status(400).json({ message: 'Please provide an array of materials' });
        }

        const materials = req.body.materials;
        const results = {
            success: [],
            failed: [],
        };

        for (const materialData of materials) {
            try {
                const existing = await Material.findOne({ name: materialData.name });
                if (existing) {
                    results.failed.push({
                        name: materialData.name,
                        reason: 'Material already exists',
                    });
                    continue;
                }

                const material = await Material.create({
                    ...materialData,
                    lastUpdatedBy: req.user._id,
                });
                results.success.push(material);
            } catch (err) {
                results.failed.push({
                    name: materialData.name,
                    reason: err.message,
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Imported ${results.success.length} materials, ${results.failed.length} failed`,
            results,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
