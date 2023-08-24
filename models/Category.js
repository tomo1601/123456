const sql = require("mssql");

const getAllCate = async (request) => {
  const sqlQuery ="Select CategoryID as id, ten, icon, href from Web_Job_Categories "
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const getCateById = async (request) => {
  const sqlQuery =
    "Select CategoryID as id, ten, icon, href from Web_Job_Categories" +
    " Where CategoryID= @CategoryID";
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const createNewCate = async (request) => {
  const sqlQuery =
    "INSERT INTO Web_Job_Categories (ten, icon, href) " +
    " OUTPUT INSERTED.CategoryID as id, INSERTED.ten, INSERTED.icon, INSERTED.href" +
    " VALUES (@ten, @icon, @href)";
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const updateCate = async (request) => {
  const sqlQuery =
    "Update Web_Job_Categories " +
    " set ten=@ten, icon=@icon, href=@href "+
    " OUTPUT inserted.CategoryID as id, inserted.ten, inserted.icon, inserted.href" +
    " Where CategoryID= @CategoryID";
  const res = await request.query(sqlQuery);
  return res.recordset;
};

const deleteCate = async (request) => {
  const sqlQuery =
    "delete from Web_Job_Categories " +
    " OUTPUT deleted.CategoryID, deleted.ten, deleted.icon, deleted.href" +
    " where CategoryID = @CategoryID";
  const res = await request.query(sqlQuery);
  return res.recordset;
};


module.exports = {
  getAllCate, 
  getCateById,  
  createNewCate,
  updateCate,
  deleteCate
};
