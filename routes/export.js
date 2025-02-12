const express = require('express');
const excel = require('excel4node');
const path = require('path');
const Form = require('../db');
const fs = require('fs');  // Regular fs for streams
const fsPromises = require('fs').promises;  // Promises version for async operations
const router = express.Router();

router.get('/', async (req, res) => {
    let filePath = null;
    
    try {
        // Fetch all players from your existing Player model
        const players = await Form.find({}).lean();

        if (!players.length) {
            return res.status(404).json({ message: 'No players found' });
        }

        // Create workbook and worksheet
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Players');

        // Styles
        const headerStyle = workbook.createStyle({
            font: {
                bold: true,
                size: 12,
                color: '#ffffff'
            },
            fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: '#2E86C1'
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center'
            }
        });

        const cellStyle = workbook.createStyle({
            alignment: {
                horizontal: 'left',
                vertical: 'center'
            }
        });

        const dateStyle = workbook.createStyle({
            numberFormat: 'dd/mm/yyyy hh:mm:ss',
            alignment: {
                horizontal: 'left'
            }
        });

        // Headers
        const headers = [
            'Name',
            'Age',
            'Mobile Number',
            'Ward Number',
            'Role',
            'Profile Picture',
            'UPI Transaction ID',
            'Transaction Screenshot',
            'Registration Date'
        ];

        // Set headers
        headers.forEach((header, index) => {
            worksheet.cell(1, index + 1)
                .string(header)
                .style(headerStyle);
        });

        // Set column widths
        worksheet.column(1).setWidth(30);  // Name
        worksheet.column(2).setWidth(10);  // Age
        worksheet.column(3).setWidth(15);  // Mobile
        worksheet.column(4).setWidth(15);  // Ward
        worksheet.column(5).setWidth(15);  // Role
        worksheet.column(6).setWidth(50);  // Profile Pic
        worksheet.column(7).setWidth(30);  // UPI ID
        worksheet.column(8).setWidth(50);  // Transaction Screenshot
        worksheet.column(9).setWidth(25);  // Date

        // Write data
        players.forEach((player, index) => {
            const rowIndex = index + 2;

            worksheet.cell(rowIndex, 1).string(player.name).style(cellStyle);
            worksheet.cell(rowIndex, 2).number(player.age).style(cellStyle);
            worksheet.cell(rowIndex, 3).number(player.mobileNumber).style(cellStyle);
            worksheet.cell(rowIndex, 4).string(player.wardNumber).style(cellStyle);
            worksheet.cell(rowIndex, 5).string(player.role).style(cellStyle);
            worksheet.cell(rowIndex, 6).string(player.profilePic).style(cellStyle);
            worksheet.cell(rowIndex, 7).string(player.upiTransactionId).style(cellStyle);
            worksheet.cell(rowIndex, 8).string(player.transactionScreenshot).style(cellStyle);
            worksheet.cell(rowIndex, 9).date(new Date(player.createdAt)).style(dateStyle);
        });

        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, '../temp');
        await fsPromises.mkdir(tempDir, { recursive: true });

        // Generate unique filename
        const fileName = `Players_Export_${Date.now()}.xlsx`;
        filePath = path.join(tempDir, fileName);

        // Write workbook to file
        await workbook.write(filePath);

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Send file
        res.sendFile(filePath, async (err) => {
            // Clean up: delete file after sending
            try {
                await fsPromises.unlink(filePath);
            } catch (deleteErr) {
                console.error('Error deleting file:', deleteErr);
            }
            
            if (err) {
                console.error('Error sending file:', err);
            }
        });

    } catch (error) {
        // Clean up file if it exists and there was an error
        if (filePath) {
            try {
                await fsPromises.unlink(filePath);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }
        
        console.error('Export error:', error);
        res.status(500).json({ message: 'Error generating export' });
    }
});

module.exports = router;