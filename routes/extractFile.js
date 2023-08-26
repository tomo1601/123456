const express = require('express')
const router = express.Router()
const fs = require("fs");
const multer = require('multer');
const {extractFileWordToObject} = require('../middlewares/extractedFIleToObject');
const {toObject} = require('../middlewares/extarctedPdfFile')

const storage = multer.diskStorage({
    destination: (req,file, cd) => {
        cd(null, 'files/')
    },
    filename: (req, file, cb) => {
        cb(null,  Date.now() + file.originalname);
    }
})

const upload = multer({storage})

router.post('/extractFile',upload.single('file'), async (req, res) => {
    
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        else {
            if(req.file.filename.includes('.docx')){
                const result = await extractFileWordToObject(req.file.path)
                res.status(200).json({
                    success: true, data: result
                })
            }
            else {const result = await toObject(req.file.path)
                res.status(200).json({
                    success: true, data: result
                })
            }
        
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
                /* console.log(`File: ${req.file.filename} deleted successfully`); */
            });
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

module.exports = router

/**
 * @swagger
 * /api/file/extractFile:
 *   post:
 *     summary: Extract data from uploaded file
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:  # Replace these properties with actual properties returned by your API
 *                     exampleProperty1:
 *                       type: string
 *                     exampleProperty2:
 *                       type: number
 *                     exampleProperty3:
 *                       type: boolean
 *       400:
 *         description: No file uploaded or invalid file format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
