const express = require('express')
const sql = require("mssql");
const router = express.Router()
const {
    getResumeId, getResumeHeadline, getResumeKeySkill, getResumeEmployment, getResumeEducation,
    getResumeItSkill, getResumeProject, getResumeProfileSumary, getAccomplishmentProfile, getAccomplishmentId,
    getAccomplishmentWork, getAccomplishmentWhitePaper, getAccomplishmentPresentation, getAccomplishmentPatent,
    getAccomplishmentCertification, getDesiredCareer, getPersonDetail, getAttackResume
      } = require('../models/NguoiTimViec.Resume')

router.get('/jobs-profile/:id', async(req, res) => {
    
    const request = new sql.Request();

    const id = req.params.id
    request.input('userId', sql.Int, id)

    let sqlQuery = 'select * from Web_Users where userId = @userId' 
    
    try {
        const result1 = await request.query(sqlQuery)
        if(result1.recordset.length ===0)  res.status(400).json({success: false, message: 'User is not found!' });
        else {
            let sqlQuery1 = 'select a.userId as id, ' +
                            ' b.fullName, b.professionTitle, b.langueges, b.age, b.currentSalary, b.expectedSalary, b.description, '+
                            ' c.logoDaiDien as hinhDaiDien,' +
                            ' d.phone, d.email, d.country, d.postCode, d.address, d.city' +
                            ' from Web_Users a '+
                            ' left join Web_User_Info_NguoiTimViec b on a.userId = b.userId ' + 
                            ' left join Web_User_HinhDaiDien c on a.userId = c.userId '+
                            ' left join Web_User_Info_Contact d on a.userId = d.userId '+ 
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

router.get('/resume/headline/:id', async (req, res) => {
    
    const request = new sql.Request();
    try {
        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)
    
        const resultResumeheadline = await getResumeHeadline(request)
        if(resultResumeheadline===-1) res.status(200).json({success: true, resumeHeadline: null });
        else res.status(200).json({success: true, resumeHeadline: resultResumeheadline[0] });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

router.get('/resume/key-skill/:id', async (req, res) => {
    
    const request = new sql.Request();
    try {
        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)
    
        const resultResumeKeySkill = await getResumeKeySkill(request)
        if(resultResumeKeySkill===-1) res.status(200).json({success: true, resumeKeySkill: null });
        else 
        res.status(200).json({success: true, resumeKeySkill: resultResumeKeySkill[0] });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Internal server error!"})
    }

})

router.get('/resume/employment/:id', async (req, res) => {
    
    const request = new sql.Request();
    try {

        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)
        
        const resultResumeEmployment = await getResumeEmployment(request)
        if(resultResumeEmployment===-1) res.status(200).json({success: true, resumeEmployment: null });
        else 
        res.status(200).json({success: true, resumeEmployment: resultResumeEmployment });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Internal server error!"})
    }
})

router.get('/resume/education/:id', async (req, res) => {
    
    const request = new sql.Request();
    try {

        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)
        
        const resultResumeEducation = await getResumeEducation(request)
        if(resultResumeEducation===-1) res.status(200).json({success: true, resumeEducation: null });
        else 
        res.status(200).json({success: true, resumeEducation: resultResumeEducation });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Internal server error!"})
    }
})

router.get('/resume/it-skill/:id', async (req, res) => {
    
    const request = new sql.Request();
    try {

        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)
        
        const resultResumeItSkill = await getResumeItSkill(request)
        if(resultResumeItSkill===-1) res.status(200).json({success: true, ItSkill: null });
        else 
        res.status(200).json({success: true, ItSkill: resultResumeItSkill });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Internal server error!"})
    }
})

router.get('/resume/project/:id', async (req, res) => {
    
    const request = new sql.Request();
    try {

        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)
        
        const resultResumeProject = await getResumeProject(request)
        if(resultResumeProject===-1) res.status(200).json({success: true, project: null });
        else 
        res.status(200).json({success: true, project: resultResumeProject });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Internal server error!"})
    }
})

router.get('/resume/profile-sumary/:id', async (req, res) => {
    
    const request = new sql.Request();
    try {
        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)
    
        const resultProfileSumary = await getResumeProfileSumary(request)
        if(resultProfileSumary===-1) res.status(200).json({success: true, profileSumary: null });
        else res.status(200).json({success: true, profileSumary: resultProfileSumary[0] });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

router.get('/resume/accomplishment/:id/:property', async (req, res) => {
    
    const request = new sql.Request();
    try {
        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)

        const accomId = await getAccomplishmentId(request)
        request.input('accomplishmentID', sql.Int, accomId)

        if(req.params.property==='profile'){   
            const accompProfile = await getAccomplishmentProfile(request)
            if(accompProfile===-1) res.status(200).json({success: true, profile: null });
            else res.status(200).json({success: true, profile: accompProfile });
        }
        else if (req.params.property === 'work'){
             const accompWork = await getAccomplishmentWork(request)
            if(accompWork===-1) res.status(200).json({success: true, work: null });
            else res.status(200).json({success: true, work: accompWork });
            
        }
        else if (req.params.property === 'white-paper'){
            const accompWhitePaper = await getAccomplishmentWhitePaper(request)
            if(accompWhitePaper===-1) res.status(200).json({success: true, whitePaper: null });
            else res.status(200).json({success: true, whitePaper: accompWhitePaper });
            
        }
        else if (req.params.property === 'presentation'){
            const accompPresentation = await getAccomplishmentPresentation(request)
            if(accompPresentation===-1) res.status(200).json({success: true, presentation: null });
            else res.status(200).json({success: true, presentation: accompPresentation });
            
        }
        else if (req.params.property === 'patent'){
            const accompPatent = await getAccomplishmentPatent(request)
            if(accompPatent===-1) res.status(200).json({success: true, patent: null });
            else res.status(200).json({success: true, patent: accompPatent });
            
        }
        else if (req.params.property === 'certification'){
            const accompCertification = await getAccomplishmentCertification(request)
            if(accompCertification===-1) res.status(200).json({success: true, certification: null });
            else res.status(200).json({success: true, certification: accompCertification });
            }
        else res.status(400).json({success: false, message: `This ${req.params.property} is not found!` });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

router.get('/resume/accomplishment/:id', async (req, res) => {
    
    const request = new sql.Request();

    try {
        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)

        const accomId = await getAccomplishmentId(request)
        request.input('accomplishmentID', sql.Int, accomId)

        let accomplishmentResult = {}

        const accompProfile = await getAccomplishmentProfile(request)
        const accompWork = await getAccomplishmentWork(request)
        const accompWhitePaper = await getAccomplishmentWhitePaper(request)
        const accompPresentation = await getAccomplishmentPresentation(request)
        const accompPatent = await getAccomplishmentPatent(request)
        const accompCertification = await getAccomplishmentCertification(request)


        accomplishmentResult['profile']= accompProfile ===-1 ?null : accompProfile
        accomplishmentResult['work']= accompWork ===-1 ?null : accompWork
        accomplishmentResult['whitePaper']= accompWhitePaper ===-1 ?null : accompWhitePaper
        accomplishmentResult['presentation']= accompPresentation ===-1 ?null : accompPresentation
        accomplishmentResult['patent']= accompPatent ===-1 ?null : accompPatent
        accomplishmentResult['certification']= accompCertification ===-1 ?null : accompCertification
        
        res.status(200).json({success: true, accomplishment: accomplishmentResult });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

router.get('/resume/desired/:id', async (req, res) => {
    
    const request = new sql.Request();
    try {

        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)
        
        const resultResumeDesired = await getDesiredCareer(request)
        if(resultResumeDesired===-1) res.status(200).json({success: true, Desired: null });
        else 
        res.status(200).json({success: true, Desired: resultResumeDesired[0] });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Internal server error!"})
    }
})

router.get('/resume/personal-detail/:id', async (req, res) => {
    
    const request = new sql.Request();
    try {

        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)
        
        const resultResumeDetail = await getPersonDetail(request)
        if(resultResumeDetail===-1) res.status(200).json({success: true, detail: null });
        else 
        res.status(200).json({success: true, detail: resultResumeDetail[0] });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Internal server error!"})
    }
})

router.get('/resume/attack-resume/:id', async (req, res) => {
    
    const request = new sql.Request();
    try {

        const result = await getResumeId(req.params.id, request)
        request.input('resumeId', sql.Int, result)
        
        const attackResume = await getAttackResume(request)
        if(attackResume===-1) res.status(200).json({success: true, attackResume: null });
        else 
        res.status(200).json({success: true, attackResume: attackResume[0] });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Internal server error!"})
    }
})


module.exports = router