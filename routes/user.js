const express = require('express');
const router = express.Router();
const multer = require('multer');
const Form = require('../db');
const cors = require('cors');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
      // Use Date.now() and original extension without path library
      cb(null, `${file.fieldname}-${Date.now()}${file.originalname.match(/\.[0-9a-z]+$/i)[0]}`)
    },
  })

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

// Configure CORS
// user.js
const corsOptions = {
    origin: 'http://127.0.0.1:5500', // Your frontend URL
    methods: ['POST', 'GET'],
    credentials: true,
    allowedHeaders: ['Content-Type']
};

router.use(cors(corsOptions));

// Create uploads directory
const fs = require('fs');
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Fix file field names to match frontend
router.post('/submit-form', 
    upload.fields([
        { name: 'photo', maxCount: 1 },  // Changed from profilePic
        { name: 'paymentScreenshot', maxCount: 1 }  // Changed from transactionScreenshot
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
                profilePic: req.files['photo'][0].path,
                transactionScreenshot: req.files['paymentScreenshot'][0].path
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


// // Apply CORS middleware


// // API endpoint for form submission
// router.get('/success',async (req,res) => {
//     res.status(200).json({
//         message: "Connection successfull"
//     })
// })
// router.post('/submit-form', 
//     upload.fields([
//         { name: 'profilePic', maxCount: 1 },
//         { name: 'transactionScreenshot', maxCount: 1 }
//     ]),
//     async (req, res) => {
//         try {
//             // Validate if files were uploaded
//             if (!req.files || !req.files['profilePic'] || !req.files['transactionScreenshot']) {
//                 return res.status(400).json({ error: 'Please upload both profile picture and transaction screenshot' });
//             }

//             // Create new form document
//             const formData = {
//                 name: req.body.name,
//                 age: parseInt(req.body.age),
//                 wardNumber: req.body.wardNumber,
//                 role: req.body.role,
//                 upiTransactionId: req.body.upiTransactionId,
//                 profilePic: req.files['profilePic'][0].path,
//                 transactionScreenshot: req.files['transactionScreenshot'][0].path
//             };

//             // Basic validation
//             if (!formData.name || !formData.age || !formData.wardNumber || 
//                 !formData.role || !formData.upiTransactionId) {
//                 return res.status(400).json({ error: 'All fields are required' });
//             }

//             // Create and save the form document
//             const form = new Form(formData);
//             await form.save();

//             res.status(201).json({
//                 message: 'Form submitted successfully',
//                 formId: form._id
//             });

//         } catch (error) {
//             console.error('Error submitting form:', error);
//             res.status(500).json({
//                 error: 'Error submitting form',
//                 details: error.message
//             });
//         }
//     }
// );

// // Error handling middleware
// router.use((error, req, res, next) => {
//     if (error instanceof multer.MulterError) {
//         if (error.code === 'LIMIT_FILE_SIZE') {
//             return res.status(400).json({
//                 error: 'File size is too large. Max limit is 5MB'
//             });
//         }
//     }
//     res.status(500).json({
//         error: error.message
//     });
// });

module.exports = router;
