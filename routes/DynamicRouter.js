const express = require('express')
const router = express.Router()

router.get("/:module", async(req, res) => {
    const module = req.params.module
    const query = req.query
    const path = `/api/${module}`
    res.redirect(path)
    /* res.status(200).json({module: module, query: query}) */
})

module.exports = router

/**
 * @swagger
 * /api/module/{module}:
 *   get:
 *     summary: Get data based on module and query parameters
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *         description: Module name
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID
 *       - in: query
 *         name: href
 *         schema:
 *           type: string
 *         description: Href
 *       - in: query
 *         name: linhvuc
 *         schema:
 *           type: string
 *         description: Linh vuc
 *       - in: query
 *         name: thanhpho
 *         schema:
 *           type: string
 *         description: Thanh pho
 *       - in: query
 *         name: mucluong
 *         schema:
 *           type: string
 *         description: Muc luong
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Level
 *       - in: query
 *         name: loaicongviec
 *         schema:
 *           type: string
 *         description: Loai cong viec
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 module:
 *                   type: string
 *                 query:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     href:
 *                       type: string
 *                     linhvuc:
 *                       type: string
 *                     thanhpho:
 *                       type: string
 *                     mucluong:
 *                       type: string
 *                     level:
 *                       type: string
 *                     loaicongviec:
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
