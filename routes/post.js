const express = require('express')
const router = express.Router()
const sql = require("mssql");
const multer = require('multer');
const {getJobs} = require('../models/Jobs')
const fs = require('fs');

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

const createSqlInput = (obj, request) => {
  const keys = Object.keys(obj);
  for (const key of keys) {
      request.input(`${key}`, sql.NText, obj[key])
  }
};

const getCheDoByPostId = async (postId, request) => {

    const sqlQuery = `select * from Web_Post_CheDo where IDPost = @PostId${postId}`
    let sqlQuery1 = 'select IDCheDo as id, icon, ten, href from Web_CheDo where '

    const res = await request.query(sqlQuery)

    const listCheDo = res.recordset[0].ListCheDo.split(',').map(Number)
    sqlQuery1 += generateWhereOrSql("IDCheDo",listCheDo, request)
    const res1 = await request.query(sqlQuery1)
    return (res1.recordset)
}

const getViTriTuyenDungByPostId = async (postId, request) => {

    const sqlQuery = `select ViTriTuyenDung from Web_Post_ViTriTuyenDung where IDPost = @PostId${postId}`
    let sqlQuery1 = 'select id, icon, ten, href from Web_ViTriTuyenDung where '

    const res = await request.query(sqlQuery)

    const listViTri = res.recordset.map(item => Number(item.ViTriTuyenDung)); 
    console.log(listViTri)
    sqlQuery1 += generateWhereOrSql("id",listViTri, request)
    const res1 = await request.query(sqlQuery1)
    return (res1.recordset)
}

router.get('/', async (req,res) => {
    
    const request = new sql.Request();

    const queryJson = req.query
    createSqlInput(queryJson, request)
    
    try {
        const jobs = await getJobs(request)
        if(jobs === -1) res.status(400).json({success: false, message: 'There are no jobs yet!'})
        res.status(200).json({success: true, jobs: jobs})
        
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }


})

router.get('/:id', async (req,res) => {
    
    const request = new sql.Request();

    const id = req.params.id
    request.input('id', sql.BigInt, id)

    try {

        let sqlQuery = 'select a.IDPost as id, a.PostTitle as congviec, b.MetaTitle metaTitle, b.MetaKeywords as metaKeyword , b.MetaDecriptions as metaDescription, b.AlilasPath as metaImage , c.companyName as tenTuyenDung, g.address as diaChi, d.suMenh as suMenhCongTy, d.quyMo as quyMoCongTy, e.mucLuong, e.thoiHanNopHoSo, f.logoDaiDien, a.href'+ 
            ' from Web_Post a'+
            ' left join Web_Part_Metas b on a.IDPart = b.IDPart ' +
            ' left join Web_User_Info_Company c on a.userId = c.userId' +
            ' left join Web_User_Info_Contact g on a.userId = g.userId' +
            ' left join Web_Company_SuMenh d on a.userId = d.userId' +
            ' left join Web_Post_Info e on a.IDPost = e.IDPost' +
            ' left join Web_User_HinhDaiDien f on a.userId = f.userId' +
            ' where a.IDPost = @id'
    
        const sqlQuery2 = 'select a.motachung, a.yeucauungvien, a.thongtinkhac, a.motacongviec, a.soNamKinhNghiem from Web_Post_YeuCauChiTiet a where a.IDPost = @id'

        let tuyendung
        const res1 = await request.query(sqlQuery)

        if(res1.recordset.length===0) return res.status(400).json({success: false, message: `No posts found with Post id = ${id}`})
        else {
            const res2 = await request.query(sqlQuery2)

            request.input(`PostId${id}`, sql.Int, id)
            const res3 = await getCheDoByPostId(id,request)
            const res4 = await getViTriTuyenDungByPostId(id, request)
            
            tuyendung = res1.recordset[0]
            tuyendung['chitietcongviec'] = res2.recordset[0]
            tuyendung['cheDo'] = res3
            tuyendung['viTriTuyenDung']=res4

            res.status(200).json({success: true, tinTuyenDung: tuyendung})
            }
        
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

router.get('/category/:category', async(req, res) => {

    const request = new sql.Request();
    const category = '/'+req.params.category

    try {
        const sqlQuery = " select distinct b.IDPost as id "+
                         " from Web_Job_Categories a " + 
                         " inner join Web_Post_Category b on a.CategoryID = b.CategoryID" +
                         " where a.href = @category"
    
        request.input('category', sql.NText, category)
        const result = await request.query(sqlQuery)
        const idArray = result.recordset.map(item => Number(item.id)); 

        if(idArray.length===0)res.status(400).json({success: false, message: `This category is no new job yet!`})
        else {
            let sqlQuery2 = 'select a.IDPost as id, f.logoDaiDien, a.href, c.companyName as tenTuyenDung, d.address as diaChi, e.mucLuong, e.thoiHanNopHoSo, a.PostTitle as congviec'+ 
                ' from Web_Post a'+
                ' left join Web_User_Info_Company c on a.userId = c.userId' +
                ' left join Web_User_Info_Contact d on a.userId = d.userId' +
                ' left join Web_Post_Info e on a.IDPost = e.IDPost' +
                ' left join Web_User_HinhDaiDien f on a.userId = f.userId where '
            
            sqlQuery2 += generateWhereOrSql("IDPost",idArray, request, true, 'a')

            const res1 = await request.query(sqlQuery2)
            tuyendung = res1.recordset

            for (const [index, tin] of tuyendung.entries()) {
                request.input(`PostId${tin.id}`, sql.Int, tin.id)
                const res2 = await getCheDoByPostId(tin.id,request)
                const res3 = await getViTriTuyenDungByPostId(tin.id, request)
                tuyendung[index]['cheDo'] = res2
                tuyendung[index]['viTriTuyenDung']=res3
            }
            res.status(200).json({success: true, posts: tuyendung})
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

router.get('/positions/:position', async (req, res) => {
    const request = new sql.Request();
    const position = '/'+req.params.position

    try {
        const sqlQuery = " select distinct b.IDPost as id "+
                         " from Web_Job_Categories a " + 
                         " inner join Web_Post_Category b on a.CategoryID = b.CategoryID" +
                         " where a.href = @category"
    
        request.input('category', sql.NText, category)
        const result = await request.query(sqlQuery)
        const idArray = result.recordset.map(item => Number(item.id)); 

        if(idArray.length===0)res.status(400).json({success: false, message: `This category is no new job yet!`})
        else {
            let sqlQuery2 = 'select a.IDPost as id, f.logoDaiDien, a.href, c.companyName as tenTuyenDung, c.diaChi, e.mucLuong, e.thoiHanNopHoSo, a.PostTitle as congviec'+ 
                ' from Web_Post a'+
                ' left join Web_User_Info_Company c on a.userId = c.userId' +
                ' left join Web_Post_Info e on a.IDPost = e.IDPost' +
                ' left join Web_User_HinhDaiDien f on a.userId = f.userId where '
            
            sqlQuery2 += generateWhereOrSql("IDPost",idArray, request, true, 'a')

            const res1 = await request.query(sqlQuery2)
            tuyendung = res1.recordset

            for (const [index, tin] of tuyendung.entries()) {
                request.input(`PostId${tin.id}`, sql.Int, tin.id)
                const res2 = await getCheDoByPostId(tin.id,request)
                const res3 = await getViTriTuyenDungByPostId(tin.id, request)
                tuyendung[index]['cheDo'] = res2
                tuyendung[index]['viTriTuyenDung']=res3
            }
            res.status(200).json({success: true, posts: tuyendung})
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

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