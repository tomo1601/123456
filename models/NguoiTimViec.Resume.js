const sql = require("mssql");

// generate to where or
const generateWhereOrSql = (nameCol, arr, request, isRenameTale, name) => {
    const arrays = arr;
    let queryWhere = '';
    const newNameCol = isRenameTale?`${name}.${nameCol}`:nameCol
  
    if (arrays.length === 0) {
      queryWhere += ` ${nameCol} = @notfound`;
      request.input('notfound', sql.Int, -1);
    } else {
      for (const [index, id] of arrays.entries()) {
        if(index>0) {
            queryWhere += ` or ${newNameCol} = @${nameCol}${id} `;
            request.input(`${nameCol}${id}`, sql.Int, id);
        }
        else {
            queryWhere += ` ${newNameCol} = @${nameCol}${id} `;
            request.input(`${nameCol}${id}`, sql.Int, id);
        }
      }
    }
    return queryWhere;
};

//get resumeId by userId
const getResumeId = async (userId, request) => {
    request.input('userId', sql.Int, userId)

    let sqlQuery = 'select resumeId from Web_User_Resume where userId = @userId '
    const resultResumeId = await request.query(sqlQuery)

    if(resultResumeId.recordset.length ===0 ) return -1
    else return resultResumeId.recordset[0].resumeId
}

// get resume employmentId by resume Id
const getEmploymentId = async (request) => {
    let sqlQuery = 'select employmentId from Web_Resume_Employment where resumeId = @resumeId'
    const resultEmploymentId = await request.query(sqlQuery)
    const arrId = resultEmploymentId.recordset.map((obj) => Number(obj.employmentId));
    if(arrId.length ===0 ) return -1
    else return arrId
}

const getEducationId = async (request) => {
    let sqlQuery = 'select educationId from Web_Resume_Education where resumeId = @resumeId'
    const resultEducationId = await request.query(sqlQuery)
    const arrId = resultEducationId.recordset.map((obj) => Number(obj.educationId));
    if(arrId.length ===0 ) return -1
    else return arrId
}

const getIDskill = async (request) => {
    let sqlQuery = 'select IDskill from Web_Resume_ItSkill where resumeId = @resumeId'
    const resultIDSkill = await request.query(sqlQuery)
    const arrId = resultIDSkill.recordset.map((obj) => Number(obj.IDskill));
    if(arrId.length ===0 ) return -1
    else return arrId
}

const getProjectId = async (request) => {
    let sqlQuery = 'select IDProject from Web_Resume_Project where resumeId = @resumeId'
    const resultIDProject = await request.query(sqlQuery)
    const arrId = resultIDProject.recordset.map((obj) => Number(obj.IDProject));
    if(arrId.length ===0 ) return -1
    else return arrId
}

const getAccomplishmentId = async (request) => {
    let sqlQuery = 'select accomplishmentID from Web_Resume_Accomplishment where resumeId = @resumeId'
    const accompId = await request.query(sqlQuery)
    const arrId = accompId.recordset.map((obj) => Number(obj.accomplishmentID));
    if(arrId.length === 0 ) return -1
    else return arrId[0]
}

// get resume headline by resume Id
const getResumeHeadline = async (request) => {

    let sqlQuery = 'select resumeId, headline from Web_Resume_Headline where resumeId = @resumeId '
    const resultResumeHeadline = await request.query(sqlQuery)

    if(resultResumeHeadline.recordset.length ===0 ) return -1
    else return resultResumeHeadline.recordset
}   

// get resume keyskill by resume Id
const getResumeKeySkill = async (request) => {
    let sqlQuery = 'select resumeId, keySkill from Web_Resume_KeySkill where resumeId = @resumeId '
    const resultResumeKeySkill = await request.query(sqlQuery)

    if(resultResumeKeySkill.recordset.length ===0 ) return -1
    else return resultResumeKeySkill.recordset
}

// get list Employment
const getResumeEmployment = async (request) => {
    
    const empId = await getEmploymentId(request)
    if(empId===-1) return -1
    else{
        let sqlQuery = 'select employmentId, designation, organization, isCurrentCompany, startedWork, wordedTill, description '+
                       '  from Web_Employment where ' + generateWhereOrSql('employmentId',empId, request)

        const resultResumeEmployment = await request.query(sqlQuery)

        if(resultResumeEmployment.recordset.length ===0 ) return -1
        else return resultResumeEmployment.recordset
    }
}

// get list Education
const getResumeEducation = async (request) => {
    
    const eduId = await getEducationId(request)
    if(eduId===-1) return -1
    else{
        let sqlQuery = 'select educationId, education, cource, university '+
                       ' from Web_Education where ' + generateWhereOrSql('educationId',eduId, request)

        const resultResumeEducation = await request.query(sqlQuery)

        if(resultResumeEducation.recordset.length ===0 ) return -1
        else return resultResumeEducation.recordset
    }
}

const getResumeItSkill = async (request) => {
    
    const IdITSkill = await getIDskill(request)
    if(IdITSkill===-1) return -1
    else{
        let sqlQuery = 'select IDskill, itSkill, version, lastUsed, experience '+
                       ' from Web_ItSkill where ' + generateWhereOrSql('Idskill',IdITSkill, request)

        const resultResumeItSkill = await request.query(sqlQuery)

        if(resultResumeItSkill.recordset.length ===0 ) return -1
        else return resultResumeItSkill.recordset
    }
}

const getResumeProject = async (request) => {
    
    const listIDProject = await getProjectId(request)
    if(listIDProject===-1) return -1
    else{
        let sqlQuery = 'select IDProject, projectTitle, client, startedWork, workedTill, description '+
                       ' from Web_Project where ' + generateWhereOrSql('IDProject',listIDProject, request)

        const resultResumeProject = await request.query(sqlQuery)

        if(resultResumeProject.recordset.length ===0 ) return -1
        else return resultResumeProject.recordset
    }
}

const getResumeProfileSumary = async (request) => {
    
    let sqlQuery = 'select resumeId, profileSumary from Web_Resume_ProfileSumary where resumeId = @resumeId '
    const resultResumeProfileSumary = await request.query(sqlQuery)

    if(resultResumeProfileSumary.recordset.length ===0 ) return -1
    else return resultResumeProfileSumary.recordset
}

// get accomplishment
const getAccomplishmentProfile = async (request) => {

    let sqlQuery = 'select accomplishmentID as id, profileName, url, description from Web_Accomplishment_Profile where accomplishmentID = @accomplishmentID'
    const accompProfile = await request.query(sqlQuery)
    if(accompProfile.recordset.length ===0 ) return -1
    else return accompProfile.recordset[0]
}

const getAccomplishmentWork = async (request) => {

    let sqlQuery = 'select accomplishmentID as id, workTitle, url, durationFrom, durationTo from Web_Accomplishment_Work where accomplishmentID = @accomplishmentID'
    const accompWork = await request.query(sqlQuery)
    if(accompWork.recordset.length ===0 ) return -1
    else return accompWork.recordset[0]
}

const getAccomplishmentWhitePaper = async (request) => {

    let sqlQuery = 'select accomplishmentID as id, title, url, publicOn, description from Web_Accomplishment_WhitePaper where accomplishmentID = @accomplishmentID'
    const accompWhitePaper = await request.query(sqlQuery)
    if(accompWhitePaper.recordset.length ===0 ) return -1
    else return accompWhitePaper.recordset[0]
}

const getAccomplishmentPresentation = async (request) => {

    let sqlQuery = 'select accomplishmentID as id, title, url, description from Web_Accomplishment_Presentation where accomplishmentID = @accomplishmentID'
    const accompPresentation = await request.query(sqlQuery)
    if(accompPresentation.recordset.length ===0 ) return -1
    else return accompPresentation.recordset[0]
}

const getAccomplishmentPatent = async (request) => {

    let sqlQuery = 'select accomplishmentID as id, title, url, office, status, applicationNumber, publicOn, description from Web_Accomplishment_Patent where accomplishmentID = @accomplishmentID'
    const accompPatent = await request.query(sqlQuery)
    if(accompPatent.recordset.length ===0 ) return -1
    else return accompPatent.recordset[0]
}

const getAccomplishmentCertification = async (request) => {

    let sqlQuery = 'select accomplishmentID as id, name, body, yearOnlabel from Web_Accomplishment_Certification where accomplishmentID = @accomplishmentID'
    const accompCertification = await request.query(sqlQuery)
    if(accompCertification.recordset.length ===0 ) return -1
    else return accompCertification.recordset[0]
}

const getDesiredCareer = async (request) => {
    let sqlQuery = 'select resumeId, industry, department, position, jobType, employmentType, preferedShift, avaliablityToJoin, desiredLocation, desiredIndustry from Web_Resume_Desired where resumeId = @resumeId '
    const resultResumeDesired = await request.query(sqlQuery)

    if(resultResumeDesired.recordset.length ===0 ) return -1
    else return resultResumeDesired.recordset
}

const getPersonDetail = async (request) => {
    let sqlQuery = 'select resumeId, industry, department, position, jobType, employmentType, preferedShift, avaliablityToJoin, desiredLocation, desiredIndustry from Web_Resume_Desired where resumeId = @resumeId '
    const resultResumeDesired = await request.query(sqlQuery)

    if(resultResumeDesired.recordset.length ===0 ) return -1
    else return resultResumeDesired.recordset
}

const getAttackResume = async (request) => {
    let sqlQuery = 'select resumeId, industry, department, position, jobType, employmentType, preferedShift, avaliablityToJoin, desiredLocation, desiredIndustry from Web_Resume_Desired where resumeId = @resumeId '
    const resultResumeDesired = await request.query(sqlQuery)

    if(resultResumeDesired.recordset.length ===0 ) return -1
    else return resultResumeDesired.recordset
}


module.exports = {
    getResumeId, getResumeHeadline, getResumeKeySkill, getResumeEmployment, getResumeEducation,
    getResumeItSkill, getResumeProject, getResumeProfileSumary, getAccomplishmentProfile, getAccomplishmentId,
    getAccomplishmentWork, getAccomplishmentWhitePaper, getAccomplishmentPresentation, getAccomplishmentPatent,
    getAccomplishmentCertification, getDesiredCareer, 
}