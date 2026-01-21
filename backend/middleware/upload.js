import multer from 'multer';

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else if (file.mimetype === 'text/csv' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only images, CSV, and PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

export default upload;
