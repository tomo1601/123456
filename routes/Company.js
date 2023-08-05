const express = require('express')
const sql = require("mssql");
const router = express.Router()

router.get('/company-profile/:id', async(req, res) => {
    
    const request = new sql.Request();

    const id = req.params.id
    request.input('userId', sql.Int, id)

    let sqlQuery = 'select * from Web_Users where userId = @userId' 
    
    try {
        const result1 = await request.query(sqlQuery)
        if(result1.recordset.length ===0)  res.status(400).json({success: false, message: 'User is not found!' });
        else {
            let sqlQuery1 = 'select a.userId as id, ' +
                            ' b.companyName, b.email as companyEmail, b.website, b.foundedDate, b.country as companyCountry, b.description, '+
                            ' c.logoDaiDien as hinhDaiDien,' +
                            ' d.phone, d.email as contactEmail, d.country contactContry, d.postCode, d.address, d.city,' +
                            ' e.facebook, e.twitter, e.google, e.linkedin '+
                            ' from Web_Users a '+
                            ' left join Web_User_Info_Company b on a.userId = b.userId ' +
                            ' left join Web_User_HinhDaiDien c on a.userId = c.userId '+
                            ' left join Web_User_Info_Contact d on a.userId = d.userId '+ 
                            ' left join Web_User_SocialLink e on a.userId = e.userId '+
                            ' where a.userId = @userId'         

            const result2 = await request.query(sqlQuery1)
            res.status(200).json({success: true, nguoiTimViec:result2.recordset[0] });
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }

})

module.exports = router