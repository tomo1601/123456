const express = require('express')
const router = express.Router()
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