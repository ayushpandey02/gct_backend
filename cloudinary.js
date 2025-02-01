const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'dqu8e5jmn',
    api_key: '535462597854472',
    api_secret: 'N7YuE57GzkvSCWQzMpq0ksiStVk'
});

module.exports = cloudinary;