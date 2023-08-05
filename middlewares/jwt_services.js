const jwt = require('jsonwebtoken')
require('dotenv').config
const sql = require("mssql");


const verifyAccessToken = async(req, res, next) => {
    const request = new sql.Request();


    try {
        const authHeader = req.headers['authorization']
        if(!authHeader){
            res.status(400).json({
                success: false,
                message: 'Please login!'
            })
        }

        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]

        jwt.verify(token, process.env.JWT_SECRET_KEY, (error, data) => {
            if(error){
                res.status(401).json({success: false, message: 'Unauthorized!'})
            }
            req.id = data.userId
        })
        
        const sqlQuery = 'Select * from Users where userId = @userId'
        request.input('userId', sql.Int, req.id)
        await request.query(sqlQuery,  (error, result) => {
            
            if(result.recordset.length>0) next()
            if (error) {
                console.log(error)
                res.status(400).json({success: false, message: "Unauthorized!"})
            }
            
        })

    }
    catch (error) {
        return next(error)
    }
}





module.exports = {
    verifyAccessToken
}