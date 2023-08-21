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
  sqlQuery1 += generateWhereOrSql("id",listViTri, request)
  const res1 = await request.query(sqlQuery1)
  return (res1.recordset)
}

const getCoordinateByPostId = async(postId, request) => {
  const sqlQuery = `select lat, log from Web_Post_ToaDo where IDPost = @PostId${postId}`
  
  const res = await request.query(sqlQuery)
  return (res.recordset[0])
}

const getJobs = async (request) => {

  let sqlQuery = 'select a.IDPost as id, f.logoDaiDien, a.href, c.companyName as tenTuyenDung, d.address as diaChi, e.mucLuong, e.thoiHanNopHoSo, a.PostTitle as congviec'+ 
  ' from Web_Post a'+
  ' left join Web_User_Info_Company c on a.userId = c.userId' +
  ' left join Web_User_Info_Contact d on a.userId = d.userId' +
  ' left join Web_Post_Info e on a.IDPost = e.IDPost' +
  ' left join Web_User_HinhDaiDien f on a.userId = f.userId'

  let tuyendung
  const res1 = await request.query(sqlQuery)

  if(res1.recordset.length===0) return res.status(400).json({success: false, message: `There is no job yet!`})
  else {
  
  tuyendung = res1.recordset
  if(tuyendung.length===0)return -1
  else{
    for (const [index, tin] of tuyendung.entries()) {
        request.input(`PostId${tin.id}`, sql.Int, tin.id)
        const res2 = await getCheDoByPostId(tin.id,request)
        const res3 = await getViTriTuyenDungByPostId(tin.id, request)
        const res4 = await getCoordinateByPostId(tin.id, request)
        tuyendung[index]['lat'] = res4.lat
        tuyendung[index]['log']=res4.log
        tuyendung[index]['cheDo'] = res2
        tuyendung[index]['viTriTuyenDung']=res3
    }
   return tuyendung
  }
}
}


module.exports = {
    getJobs,
}