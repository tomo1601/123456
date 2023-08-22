const express = require('express')
const router = express.Router()
const {getCoordinates} = require('../middlewares/address')

router.get('/coordinates', async (req,res) => {
   const address = req.body.address
   try {
       const coor = await getCoordinates(address)
       if(coor) res.status(200).json({success: true, coordinates: {lat: coor.lat, lng: coor.lng}})
    }
    catch (error){
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

module.exports = router
