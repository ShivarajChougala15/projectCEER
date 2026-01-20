import Inventory from '../models/inventory.models.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
export const getInventory = async (req, res) => {
    try {
        const { category, lowStock } = req.query;

        let filter = {};

        if (category) {
            filter.category = category;
        }

        const inventory = await Inventory.find(filter)
            .populate('lastUpdatedBy', 'name email')
            .sort('materialName');

        // Filter low stock items if requested
        let filteredInventory = inventory;
        if (lowStock === 'true') {
            filteredInventory = inventory.filter((item) => item.quantity <= item.minStockLevel);
        }

        res.status(200).json({
            success: true,
            count: filteredInventory.length,
            inventory: filteredInventory,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id).populate('lastUpdatedBy', 'name email');

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        res.status(200).json({
            success: true,
            item,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private (Lab Incharge, Admin)
export const addInventoryItem = async (req, res) => {
    try {
        const { materialName, quantity, specifications, category, unit, minStockLevel } = req.body;

        // Check if item already exists
        const itemExists = await Inventory.findOne({ materialName });

        if (itemExists) {
            return res.status(400).json({ message: 'Material already exists in inventory' });
        }

        const item = await Inventory.create({
            materialName,
            quantity,
            specifications,
            category,
            unit,
            minStockLevel,
            lastUpdatedBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Inventory item added successfully',
            item,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Lab Incharge, Admin)
export const updateInventoryItem = async (req, res) => {
    try {
        const { materialName, quantity, specifications, category, unit, minStockLevel } = req.body;

        const item = await Inventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        item.materialName = materialName || item.materialName;
        item.quantity = quantity !== undefined ? quantity : item.quantity;
        item.specifications = specifications || item.specifications;
        item.category = category || item.category;
        item.unit = unit || item.unit;
        item.minStockLevel = minStockLevel !== undefined ? minStockLevel : item.minStockLevel;
        item.lastUpdatedBy = req.user._id;

        await item.save();

        res.status(200).json({
            success: true,
            message: 'Inventory item updated successfully',
            item,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
export const deleteInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        await item.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Inventory item deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update stock quantity
// @route   PUT /api/inventory/:id/stock
// @access  Private (Lab Incharge, Admin)
export const updateStock = async (req, res) => {
    try {
        const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

        const item = await Inventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        if (operation === 'add') {
            item.quantity += quantity;
        } else if (operation === 'subtract') {
            if (item.quantity < quantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }
            item.quantity -= quantity;
        } else {
            return res.status(400).json({ message: 'Invalid operation. Use "add" or "subtract"' });
        }

        item.lastUpdatedBy = req.user._id;
        await item.save();

        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            item,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
