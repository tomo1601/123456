const express = require("express");
const router = express.Router();
const sql = require("mssql");
const {
  createNewCate, updateCate, deleteCate, getAllCate, getCateById
} = require("../models/Category");

router.get("/", async (req, res) => {
  const request = new sql.Request();
  try {
    const result = await getAllCate(request);
    if (result) res.status(200).json({ success: true, categories: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

router.get("/:id", async (req, res) => {
  const request = new sql.Request();
  const CategoryID = req.params.id;
  request.input("CategoryID", sql.Int, CategoryID);
  try {
    const result = await getCateById(request);
    if (result) res.status(200).json({ success: true, category: result[0] });
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
      const result = await createNewCate(request);
      if (result) res.status(200).json({ success: true, message: "Created successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error!" });
    }
  });

router.put("/:id", async (req, res) => {
    const request = new sql.Request();

    const CategoryID = req.params.id;
    const {ten, icon, href} = req.body
    request.input("CategoryID", sql.Int, CategoryID);
    request.input("ten", sql.NText, ten);
    request.input("icon", sql.NText, icon);
    request.input("href", sql.NText, href);

    try {
      const result = await updateCate(request);
      if (result) res.status(200).json({ success: true, message: "Updated successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error!" });
    }
  });

router.delete("/:id", async (req, res) => {
    const request = new sql.Request();

    const CategoryID = req.params.id;
    request.input("CategoryID", sql.Int, CategoryID);

    try {
      const result = await deleteCate(request);
      if (result) res.status(200).json({ success: true, message: "Deleted successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error!" });
    }
  });

module.exports = router;

/**
 * @swagger
 * /api/danhmuc:
 *   get:
 *     summary: Get all category options
 *     tags: [Lĩnh vực công việc]
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
 * /api/danhmuc/{id}:
 *   get:
 *     summary: Get a category option by ID
 *     tags: [Lĩnh vực công việc]
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
 * /api/danhmuc:
 *   post:
 *     summary: Create a new category option
 *     tags: [Lĩnh vực công việc]
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
 * /api/danhmuc/{id}:
 *   put:
 *     summary: Update an existing category option
 *     tags: [Lĩnh vực công việc]
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
 * /api/danhmuc/{id}:
 *   delete:
 *     summary: Delete a category option
 *     tags: [Lĩnh vực công việc]
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

