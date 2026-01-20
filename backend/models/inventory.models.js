import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
    {
        materialName: {
            type: String,
            required: [true, 'Please provide material name'],
            unique: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Please provide quantity'],
            min: [0, 'Quantity cannot be negative'],
        },
        specifications: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            trim: true,
        },
        unit: {
            type: String,
            default: 'pcs',
        },
        minStockLevel: {
            type: Number,
            default: 10,
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
