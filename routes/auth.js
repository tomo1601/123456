const express = require('express')
const router = express.Router()
const sql = require("mssql");
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const {verifyAccessToken} = require('../middlewares/jwt_services')
require('dotenv').config()

//convert Date time

convertDateTimeFormat = (dateTime) => {
    const isoDateTime = dateTime.toISOString();
    const formattedDateTime = isoDateTime.replace("T", " ").slice(0, -5);
    return formattedDateTime;
  }

router.get('/', verifyAccessToken, (req, res) => {
    console.log('next')
})

router.post('/register', async (req,res) => {
    const request = new sql.Request();

    const {username, password} = req.body
    const hashPass = await crypto.createHash('md5').update(password).digest('hex');
    const sqlQuery = "INSERT INTO Web_Users (username, password, createDate) " +
                     " OUTPUT INSERTED.userId, INSERTED.username, INSERTED.createDate" +
                     " VALUES (@username, @hashpassword, @createDate)"
    request.input('username', sql.VarChar, username)
    request.input('hashpassword', sql.VarChar, hashPass)
    const datenow = new Date()
    request.input('createDate', sql.VarChar, convertDateTimeFormat(datenow))
    
    try {
        await request.query(sqlQuery, (error, result) => {
            console.log(result)
            if(error) throw error
            else res.status(200).json({
                success: true, message: 'Register successfully!'
            })
        })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }

})

router.post('/login', async (req,res) => {
    
    const request = new sql.Request();

    const {username, password} = req.body
    request.input('username', sql.VarChar, username)
    
    let sqlQuery = 'select * from Web_Users where username = @username or email = @username'

    try {
        await request.query(sqlQuery, async (error, result) => {
            if(error) throw error
            else {
                
                const inputPassword = await crypto.createHash('md5').update(password).digest('hex');
                if(inputPassword === result.recordset[0].password){
                    const token = jwt.sign({ userId: result.recordset[0].userId }, process.env.JWT_SECRET_KEY,{ expiresIn: 604800 })
                    const sqlQuery = "UPDATE Web_Users SET token = @token where username = @username and userId = @userId"
                    request.input('token', sql.VarChar, token)
                    request.input('userId', sql.Int, result.recordset[0].userId)
        
                    await request.query(sqlQuery, (error) => {
                        if(error) throw error
                        else res.status(200).json({
                        success: true, 
                        message: 'Login successfully!',
                        token: token
                    })
                })}
                else res.status(400).json({
                    success: false,
                    message: "Username or Password is incorrect"
                })

            }
        })
        
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }


})


module.exports = router