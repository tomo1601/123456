const express = require("express");
const router = express.Router();
const sql = require("mssql");
const {verifyAccessToken} = require('../middlewares/jwt_services')
const {
    getAllViTriTuyenDung, GetViTriTuyenDungById,  createNewViTriTuyenDung,updateViTriTuyenDung,deleteViTriTuyenDung,getViTriTuyenDungByPostId,
} = require("../models/VitriTuyenDung");

router.get("/", async (req, res) => {
  const request = new sql.Request();
  try {
    const result = await getAllViTriTuyenDung(request);
    if (result) res.status(200).json({ success: true, viTriTuyenDung: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

router.get("/:id", async (req, res) => {
  const request = new sql.Request();
  const id = req.params.id;
  request.input("IDVTTD", sql.Int, id);
  try {
    const result = await GetViTriTuyenDungById(request);
    if (result) res.status(200).json({ success: true, viTriTuyenDung: result[0]?result[0]:[] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

router.get("/post/:id", async (req, res) => {
  const request = new sql.Request();

  const id = req.params.id
  request.input(`PostId${id}`, sql.BigInt, id)
  request.input('notfound', sql.Int, -1);


  try {
    const result = await getViTriTuyenDungByPostId(id,request);
    if (result) res.status(200).json({ success: true, viTriTuyenDung: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});


router.post("/",verifyAccessToken, async (req, res) => {
    const request = new sql.Request();

    const {ten, icon, href} = req.body
    request.input("ten", sql.NText, ten);
    request.input("icon", sql.NText, icon);
    request.input("href", sql.NText, href);

    try {
      const result = await createNewViTriTuyenDung(request);
      if (result) res.status(200).json({ success: true, message: "Created successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error!" });
    }
  });

router.put("/:id", async (req, res) => {
    const request = new sql.Request();

    const IDVTTD = req.params.id;
    const {ten, icon, href} = req.body
    request.input("IDVTTD", sql.Int, IDVTTD);
    request.input("ten", sql.NText, ten);
    request.input("icon", sql.NText, icon);
    request.input("href", sql.NText, href);

    try {
      const result = await updateViTriTuyenDung(request);
      if (result) res.status(200).json({ success: true, message: "Updated successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error!" });
    }
  });

router.delete("/:id", async (req, res) => {
    const request = new sql.Request();

    const IDVTTD = req.params.id;
    request.input("IDVTTD", sql.Int, IDVTTD);

    try {
      const result = await deleteViTriTuyenDung(request);
      if (result) res.status(200).json({ success: true, message: "Deleted successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error!" });
    }
  });

module.exports = router;

/**
 * @swagger
 * /api/vttd:
 *   get:
 *     summary: Get all position (job position) options
 *     tags: [Vị Trí Tuyển Dụng]
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
 *                 chedo:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       ten:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       href:
 *                         type: string
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
 * /api/vttd/{id}:
 *   get:
 *     summary: Get a position (job position) option by ID
 *     tags: [Vị Trí Tuyển Dụng]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the chedo option
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
 *                 chedo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     ten:
 *                       type: string
 *                     icon:
 *                       type: string
 *                     href:
 *                       type: string
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
 * /api/vttd/post/{id}:
 *   get:
 *     summary: Get position (job position) options for a specific post
 *     tags: [Vị Trí Tuyển Dụng]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the post
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
 *                 chedo:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       ten:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       href:
 *                         type: string
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
 * /api/vttd:
 *   post:
 *     summary: Create a new position (job position) option
 *     tags: [Vị Trí Tuyển Dụng]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ten:
 *                 type: string
 *               icon:
 *                 type: string
 *               href:
 *                 type: string
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
 * /api/vttd/{id}:
 *   put:
 *     summary: Update an existing position (job position) option
 *     tags: [Vị Trí Tuyển Dụng]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the chedo option
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ten:
 *                 type: string
 *               icon:
 *                 type: string
 *               href:
 *                 type: string
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
 * /api/vttd/{id}:
 *   delete:
 *     summary: Delete a position (job position) option
 *     tags: [Vị Trí Tuyển Dụng]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the chedo option
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

