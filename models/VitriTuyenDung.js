const sql = require("mssql");

// generate to where or
const generateWhereOrSql = (nameCol, arr, request, isRenameTale, name) => {
  const arrays = arr;
  let queryWhere = '';
  const newNameCol = isRenameTale?`${name}.${nameCol}`:nameCol

  if (arrays.length === 0) {
    queryWhere += ` ${nameCol} = @notfound`;
  } else {
    for (const [index, id] of arrays.entries()) {
      if(!request.parameters.hasOwnProperty(nameCol+id)) request.input(`${nameCol}${id}`, sql.Int, id);
      if(index>0) {
          queryWhere += ` or ${newNameCol} = @${nameCol}${id} `;
      }
      else {
          queryWhere += ` ${newNameCol} = @${nameCol}${id} `;
      }
    }
  }
  return queryWhere;
};

const getAllViTriTuyenDung = async (request) => {
  const sqlQuery ="Select  id, ten, icon, href from Web_ViTriTuyenDung "
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const GetViTriTuyenDungById = async (request) => {
  const sqlQuery =
    "Select * from Web_ViTriTuyenDung " +
    " Where id= @IDVTTD";
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const createNewViTriTuyenDung = async (request) => {
  const sqlQuery =
    "INSERT INTO Web_ViTriTuyenDung (ten, icon, href) " +
    " OUTPUT INSERTED.id, INSERTED.ten, INSERTED.icon, INSERTED.href" +
    " VALUES (@ten, @icon, @href)";
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const updateViTriTuyenDung = async (request) => {
  const sqlQuery =
    "Update Web_ViTriTuyenDung " +
    " set ten=@ten, icon=@icon, href=@href "+
    " OUTPUT inserted.id, inserted.ten, inserted.icon, inserted.href" +
    " where id = @IDVTTD"
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const deleteViTriTuyenDung = async (request) => {
  const sqlQuery =
    "delete from Web_ViTriTuyenDung " +
    " OUTPUT deleted.id, deleted.ten, deleted.icon, deleted.href" +
    " where id = @IDVTTD";
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const getViTriTuyenDungByPostId = async (postId, request) => {
  
    const sqlQuery = `select ViTriTuyenDung from Web_Post_ViTriTuyenDung where IDPost = @PostId${postId}`
    let sqlQuery1 = 'select id, icon, ten, href from Web_ViTriTuyenDung where '
    
    const res = await request.query(sqlQuery)
    
    const listViTri = res.recordset.map(item => Number(item.ViTriTuyenDung)); 
    sqlQuery1 += generateWhereOrSql("id",listViTri, request)
    const res1 = await request.query(sqlQuery1)
    return (res1.recordset)
  }

module.exports = {
    getAllViTriTuyenDung, 
    GetViTriTuyenDungById,  
    createNewViTriTuyenDung,
    updateViTriTuyenDung,
    deleteViTriTuyenDung,
    getViTriTuyenDungByPostId,
};
