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
  console.log(listViTri)
  sqlQuery1 += generateWhereOrSql("id",listViTri, request)
  const res1 = await request.query(sqlQuery1)
  return (res1.recordset)
}


const getJobs = async (request) => {
    
}

module.exports = {
    
}