const express = require('express');
const router = express.Router();
const multer = require('multer');
const Form = require('../db');
const cors = require('cors');
const cloudinary = require('../cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cricket-registration',
        format: async (req, file) => {
            // Extract extension from original file
            const extension = file.originalname.match(/\.[0-9a-z]+$/i)[0].substring(1);
            return extension;
        },
        public_id: (req, file) => {
            // Recreate the same filename pattern as before
            return `${file.fieldname}-${Date.now()}`;
        },
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// CORS configuration remains the same
const corsOptions = {
    origin: 'http://127.0.0.1:5500',
    methods: ['POST', 'GET'],
    credentials: true,
    allowedHeaders: ['Content-Type']
};

router.use(cors(corsOptions));

// Modified form submission route
router.post('/submit-form', 
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'paymentScreenshot', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            console.log("Files received:", req.files);
            console.log("Body received:", req.body);
            
            if (!req.files || !req.files['photo'] || !req.files['paymentScreenshot']) {
                return res.status(400).json({ error: 'Please upload both photos' });
            }

            const formData = {
                name: req.body.name,
                age: parseInt(req.body.age),
                mobileNumber: parseInt(req.body.mobileNumber),
                wardNumber: req.body.wardNumber,
                role: req.body.role,
                upiTransactionId: req.body.upiTransactionId,
                profilePic: req.files['photo'][0].path, // Cloudinary URL
                transactionScreenshot: req.files['paymentScreenshot'][0].path // Cloudinary URL
            };

            const form = new Form(formData);
            await form.save();

            res.status(201).json({
                message: 'Form submitted successfully',
                formId: form._id
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                error: 'Error submitting form',
                details: error.message
            });
        }
    }
);

module.exports = router;