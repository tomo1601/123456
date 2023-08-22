const express = require('express')
const router = express.Router()
const sql = require("mssql");
/* const multer = require('multer'); */
const {getCheDoByPostId, getViTriTuyenDungByPostId, getJobs, createPostCategory, createPostToaDo, deletePostToaDo,deleteOneCategory,  deleteOnePostCategory,
       getCoordinateByPostId, createNewPost, updatePost
} 
    = require('../models/Jobs')

const {getCoordinates} = require('../middlewares/address');
const { verifyAccessToken } = require('../middlewares/jwt_services');

/* 
const storage = multer.diskStorage({
    destination: (req,file, cd) => {
        cd(null, 'files/')
    },
    filename: (req, file, cb) => {
        cb(null,  Date.now() + file.originalname);
    }
})

const upload = multer({storage}) */

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

const coordinatesInCircleRange = (centerLongitude, centerLatitude, radius, pointLongitude, pointLatitude) =>{
    const earthRadius = 6371000; // Đường kính trái đất trong mét

    const centerLatRad = centerLatitude * (Math.PI / 180);
    const pointLatRad = pointLatitude * (Math.PI / 180);

    const deltaLongitude = Math.abs(centerLongitude - pointLongitude) * (Math.PI / 180);
    const centralAngle = Math.acos(
        Math.sin(centerLatRad) * Math.sin(pointLatRad) +
        Math.cos(centerLatRad) * Math.cos(pointLatRad) * Math.cos(deltaLongitude)
    );

    const distance = earthRadius * centralAngle;
    return distance <= radius;
}

const createSqlInput = (obj, request) => {
  const keys = Object.keys(obj);
  for (const key of keys) {
      request.input(`${key}`, sql.NText, obj[key])
  }
};

router.get('/', async (req,res) => {
    
    const request = new sql.Request();

    const queryJson = req.query
    createSqlInput(queryJson, request)
    request.input('notfound', sql.Int, -1);

    
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

router.get('/postId/:id', async (req,res) => {
    
    const request = new sql.Request();

    const id = req.params.id
    request.input('id', sql.BigInt, id)
    request.input('notfound', sql.Int, -1);

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
                const res4 = await getCoordinateByPostId(tin.id, request)
                tuyendung[index]['lat'] = res4.lat
                tuyendung[index]['lng']=res4.lng
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
                const res4 = await getCoordinateByPostId(tin.id, request)
                tuyendung[index]['lat'] = res4.lat
                tuyendung[index]['lng']=res4.lng
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


router.get('/coordinate', async (req,res) => {
    
    const request = new sql.Request();

    const coor = req.body
   
    try {
        const jobs = await getJobs(request)
        if(jobs === -1) res.status(400).json({success: false, message: 'There are no jobs yet!'})
        else{
            const newJpbs = jobs.filter(item=>coordinatesInCircleRange(coor.lat, coor.lng, coor.radius, item.lat, item.lng))
            res.status(200).json({success: true, jobs: newJpbs})
        }
        
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }


})

router.post('/toado', async(req, res) => {
    const request = new sql.Request()

    try {
        const {postId, address} = req.body
        const coor = await getCoordinates(address)
        request.input('IDPost',sql.BigInt, postId)
        request.input('lat',sql.Float, coor.lat)
        request.input('lng',sql.Float, coor.lng)
    
        await createPostToaDo(request)
        res.status(200).json({success: true, message: "Successfully!"})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})
router.delete('/toado', async(req, res) => {
    const request = new sql.Request()

    try {
        const {postId} = req.body
        request.input('IDPost',sql.BigInt, postId)
    
        const result = await deletePostToaDo(request)
        console.log(result)
        res.status(200).json({success: true, message: "Successfully!"})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})


router.post('/category', async(req, res) => {
    const request = new sql.Request()

    try {
        const {postId, categoryId} = req.body
        request.input('IDPost',sql.BigInt, postId)
        request.input('cateId',sql.BigInt, categoryId)
    
        await createPostCategory(request)
        res.status(200).json({success: true, message: "Successfully!"})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

router.delete('/category', async(req, res) => {
    const request = new sql.Request()

    try {
        const {postId, categoryId} = req.body
        request.input('IDPost',sql.BigInt, postId)
        request.input('cateId',sql.BigInt, categoryId)
    
        await deletePostCategory(request)
        res.status(200).json({success: true, message: "Successfully!"})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

router.delete('/delete-all-category', async(req, res) => {
    const request = new sql.Request()

    try {
        const {postId} = req.body
        request.input('IDPost',sql.BigInt, postId)
    
        await deleteOnePostCategory(request)
        res.status(200).json({success: true, message: "Successfully!"})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})


router.post('/new-post', verifyAccessToken, async(req, res) => {
    const request = new sql.Request()

    request.input('IDPart', sql.Int, 4)
    request.input('userId', sql.Int, req.userId)

    try {
        const result = await createNewPost(request)
        if(result.length>0) res.status(200).json({success: true, post: result[0]})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

router.put('/:id', verifyAccessToken, async(req,res) => {
    const request = new sql.Request()

    const IDPost = req.params.id
    request.input('IDPost', sql.Int, IDPost)
    request.input('userId', sql.Int, req.userId)

    try {
        const result = await createNewPost(request)
        if(result.length>0) res.status(200).json({success: true, post: result[0]})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Posts
 * /api/post:
 *   get:
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter items by category
 *       - in: query
 *         name: price
 *         schema:
 *           type: number
 *         description: Filter items by price
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
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       logoDaiDien:
 *                         type: string
 *                       href:
 *                         type: string
 *                       tenTuyenDung:
 *                         type: string
 *                       diaChi:
 *                         type: string
 *                       mucLuong:
 *                         type: string
 *                       thoiHanNopHoSo:
 *                         type: string
 *                         format: date-time
 *                       congviec:
 *                         type: string
 *                       cheDo:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             icon:
 *                               type: string
 *                             ten:
 *                               type: string
 *                             href:
 *                               type: string
 *                       viTriTuyenDung:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             icon:
 *                               type: string
 *                             ten:
 *                               type: string
 *                             href:
 *                               type: string
 *       400:
 *         description: No posts found with the given ID
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


/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     summary: Get details of a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 barTitle:
 *                   type: string
 *                 metaTitle:
 *                   type: string
 *                 metaKeyword:
 *                   type: string
 *                 metaDescription:
 *                   type: string
 *                 metaImage:
 *                   type: string
 *                 tenTuyenDung:
 *                   type: string
 *                 chitietcongviec:
 *                   type: object
 *                   properties:
 *                     yeucauungvien:
 *                       type: string
 *                     thongtinkhac:
 *                       type: string
 *                     motacongviec:
 *                       type: string
 *                 suMenhCongty:
 *                   type: string
 *                 quyMoCongTy:
 *                   type: string
 *                 logoDaiDien:
 *                   type: string
 *                 href:
 *                   type: string
 *                 diaChi:
 *                   type: string
 *                 mucLuong:
 *                   type: string
 *                 soNamKinhNghiem:
 *                   type: string
 *                 thoiHanNopHoSo:
 *                   type: string
 *                   format: date
 *                 ngayTao:
 *                   type: string
 *                   format: date
 *                 capNhatLanCuoi:
 *                   type: string
 *                   format: date
 *                 congviec:
 *                   type: string
 *                 cheDo:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       ten:
 *                         type: string
 *                       href:
 *                         type: string
 *                 viTriTuyenDung:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       ten:
 *                         type: string
 *                       href:
 *                         type: string
 *       400:
 *         description: No posts found with the given ID
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
