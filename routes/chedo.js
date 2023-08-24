const express = require("express");
const router = express.Router();
const sql = require("mssql");
const {
  createNewCheDo, updateCheDo, deleteCheDo, getAllCheDo, GetCheDoById,getCheDoByPostId
} = require("../models/CheDo");

router.get("/", async (req, res) => {
  const request = new sql.Request();
  try {
    const result = await getAllCheDo(request);
    if (result) res.status(200).json({ success: true, chedo: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

router.get("/:id", async (req, res) => {
  const request = new sql.Request();
  const IDCheDo = req.params.id;
  request.input("IDCheDo", sql.Int, IDCheDo);
  try {
    const result = await GetCheDoById(request);
    if (result) res.status(200).json({ success: true, chedo: result[0] });
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
    const result = await getCheDoByPostId(id,request);
    if (result) res.status(200).json({ success: true, chedo: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});


router.post("/", async (req, res) => {
    const request = new sql.Request();

    const {ten, icon, href} = req.body
    request.input("ten", sql.NText, ten);
    request.input("icon", sql.NText, icon);
    request.input("href", sql.NText, href);

    try {
      const result = await createNewCheDo(request);
      if (result) res.status(200).json({ success: true, message: "Created successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error!" });
    }
  });

router.put("/:id", async (req, res) => {
    const request = new sql.Request();

    const IDCheDo = req.params.id;
    const {ten, icon, href} = req.body
    request.input("IDCheDo", sql.Int, IDCheDo);
    request.input("ten", sql.NText, ten);
    request.input("icon", sql.NText, icon);
    request.input("href", sql.NText, href);

    try {
      const result = await updateCheDo(request);
      if (result) res.status(200).json({ success: true, message: "Updated successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error!" });
    }
  });

router.delete("/:id", async (req, res) => {
    const request = new sql.Request();

    const IDCheDo = req.params.id;
    request.input("IDCheDo", sql.Int, IDCheDo);

    try {
      const result = await deleteCheDo(request);
      if (result) res.status(200).json({ success: true, message: "Deleted successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error!" });
    }
  });

module.exports = router;

/**
 * @swagger
 * /api/chedo:
 *   get:
 *     summary: Get all chedo (employment benefits) options
 *     tags: [Chế độ]
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
 * /api/chedo/{IDCheDo}:
 *   get:
 *     summary: Get a chedo (employment benefits) option by ID
 *     tags: [Chế độ]
 *     parameters:
 *       - in: path
 *         name: IDCheDo
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
 * /api/chedo/post/{id}:
 *   get:
 *     summary: Get chedo (employment benefits) options for a specific post
 *     tags: [Chế độ]
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
 * /api/chedo:
 *   post:
 *     summary: Create a new chedo (employment benefits) option
 *     tags: [Chế độ]
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
 * /api/chedo/{id}:
 *   put:
 *     summary: Update an existing chedo (employment benefits) option
 *     tags: [Chế độ]
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
 * /api/chedo/{id}:
 *   delete:
 *     summary: Delete a chedo (employment benefits) option
 *     tags: [Chế độ]
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
