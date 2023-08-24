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

const getAllCheDo = async (request) => {
  const sqlQuery ="Select IDCheDo as id, ten, icon, href from Web_CheDo "
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const GetCheDoById = async (request) => {
  const sqlQuery =
    "Select * from Web_CheDo " +
    " Where IDCheDo= @IDCheDo";
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const createNewCheDo = async (request) => {
  const sqlQuery =
    "INSERT INTO Web_CheDo (ten, icon, href) " +
    " OUTPUT INSERTED.IDCheDo as id, INSERTED.ten, INSERTED.icon, INSERTED.href" +
    " VALUES (@ten, @icon, @href)";
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const updateCheDo = async (request) => {
  const sqlQuery =
    "Update Web_CheDo " +
    " set ten=@ten, icon=@icon, href=@href "+
    " OUTPUT inserted.IDCheDo as id, inserted.ten, inserted.icon, inserted.href" +
    " Where IDCheDo= @IDCheDo";
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const deleteCheDo = async (request) => {
  const sqlQuery =
    "delete from Web_CheDo " +
    " OUTPUT deleted.IDCheDo, deleted.ten, deleted.icon, deleted.href" +
    " where IDCheDo = @IDCheDo";
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const getCheDoByPostId = async (postId, request) => {

    const sqlQuery = `select cheDo from Web_Post_CheDo where IDPost = @PostId${postId}`
    let sqlQuery1 = 'select IDCheDo as id, icon, ten, href from Web_CheDo where '
    
    const res = await request.query(sqlQuery)  
    const listCheDo = res.recordset.map(obj => obj.cheDo)
    sqlQuery1 += generateWhereOrSql("IDCheDo",listCheDo, request)
    const res1 = await request.query(sqlQuery1)
    return (res1.recordset)
  }

module.exports = {
  getAllCheDo, 
  GetCheDoById,  
  createNewCheDo,
  updateCheDo,
  deleteCheDo,
  getCheDoByPostId,
};
