const sql = require("mssql");

const {getCheDoByPostId} =require('./CheDo')
const {getViTriTuyenDungByPostId} =require('./VitriTuyenDung')

const getCoordinateByPostId = async(postId, request) => {
  const sqlQuery = `select lat, lng from Web_Post_ToaDo where IDPost = @PostId${postId}`
  
  const res = await request.query(sqlQuery)
  return (res.recordset[0])
}

const getJobs = async (request) => {

  let sqlQuery = 'select a.IDPost as id, f.logoDaiDien, a.href, c.companyName as tenTuyenDung, d.address as diaChi, e.mucLuong, g.thoiHanNopHoSo, a.PostTitle as congviec'+ 
  ' from Web_Post a'+
  ' left join Web_User_Info_Company c on a.userId = c.userId' +
  ' left join Web_User_Info_Contact d on a.userId = d.userId' +
  ' left join Web_Post_MucLuong e on a.IDPost = e.IDPost' +
  ' left join Web_Post_ThoiHanNopHoSo g on a.IDPost = g.IDPost' +
  ' left join Web_User_HinhDaiDien f on a.userId = f.userId'

  let tuyendung
  const res1 = await request.query(sqlQuery)

  if(res1.recordset.length===0) return res.status(400).json({success: false, message: `There is no job yet!`})
  else {
  
  tuyendung = res1.recordset
  if(tuyendung.length===0)return -1
  else{
    for (const [index, tin] of tuyendung.entries()) {
        request.input(`PostId${tin.id}`, sql.BigInt, tin.id)
        const res2 = await getCheDoByPostId(tin.id,request)
        const res3 = await getViTriTuyenDungByPostId(tin.id, request)
        const res4 = await getCoordinateByPostId(tin.id, request)
        tuyendung[index]['lat'] = res4?res4.lat:null
        tuyendung[index]['lng']=res4?res4.lng:null
        tuyendung[index]['cheDo'] = res2
        tuyendung[index]['viTriTuyenDung']=res3
    }
   return tuyendung
  }
}
}

const createNewPost = async(request) => {
  const sqlQuery = "Insert into Web_Post (IDPart, userId)"+ 
                   " OUTPUT INSERTED.IDPost, INSERTED.IDPart, INSERTED.userId" +
                   " values (@IDPart, @userId)"
  const res = await request.query(sqlQuery)
  return (res.recordset)
}

const updatePost = async(request) => {
  const sqlQuery = "Update Web_Post "+ 
                   " Set href=@href, PostTitle=@PostTitle "+
                   " OUTPUT INSERTED.IDPost, INSERTED.href, INSERTED.PostTitle " +
                   " where IDPost=@IDPost and userId=@userId"
  const res = await request.query(sqlQuery)
  return (res.recordset)
}

const createPostCheDo = async(request) => {
  const sqlQuery = "INSERT INTO Web_Post_CheDo (IDPost, cheDo) " +
  " OUTPUT INSERTED.IDPost, INSERTED.cheDo" +
  " VALUES (@IDPost, @cheDo)"
  const res = await request.query(sqlQuery)
  return (res.recordset)
}

const deleteostCheDo = async(request) => {
  const sqlQuery = "Delete from Web_Post_CheDo " +
  " OUTPUT Deleted.IDPost, Deleted.cheDo" +
  " where IDPost=@IDPost and cheDo=@cheDo"
  const res = await request.query(sqlQuery)
  return (res.recordset)
}

const createPostToaDo = async(request) => {

  const checkExist = await request.query("Select IDPost from Web_Post_ToaDo where IDPost=@IDPost")
  if(checkExist.recordset.length>0){
    const sqlQuery = "Update Web_Post_ToaDo set lat=@lat, lng= @lng where IDPost =@IDPost"
    const res = await request.query(sqlQuery)
    return (res.recordset)
  }
  else{
    const sqlQuery = "INSERT INTO Web_Post_ToaDo (IDPost, lat, lng) " +
                     " OUTPUT INSERTED.IDPost, INSERTED.lat, INSERTED.lng" +
                     " VALUES (@IDPost, @lat, @lng)"
    const res = await request.query(sqlQuery)
    return (res.recordset)
  }
}

const deletePostToaDo = async(request) => {
  const sqlQuery = "Delete from Web_Post_ToaDo where IDPost = @IDPost"
  const res = await request.query(sqlQuery)
}

const createPostCategory = async(request) => {
  let sqlQuery = "INSERT INTO Web_Post_Category (IDPost, CategoryID) " +
                 " OUTPUT INSERTED.IDPost, INSERTED.CategoryID" +
                     ` VALUES (@IDPost, @cateId)`
  const res = await request.query(sqlQuery)
  return (res.recordset[0])
}

const deleteOneCategory = async(request) => {
  const sqlQuery = "Delete from Web_Post_Category where IDPost = @IDPost and CategoryID = @cateId"
  const res = await request.query(sqlQuery)
}

const deleteOnePostCategory = async(request) => {
  const sqlQuery = "Delete from Web_Post_Category where IDPost = @IDPost"
  const res = await request.query(sqlQuery)
  return (res.recordset)
}




module.exports = {
    getCheDoByPostId, getViTriTuyenDungByPostId, getJobs, createPostToaDo, createPostCategory, deletePostToaDo, deleteOneCategory, deleteOnePostCategory, createNewPost,
    updatePost, getCoordinateByPostId, createPostCheDo, deleteostCheDo
}