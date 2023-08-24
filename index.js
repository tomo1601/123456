const express = require('express')
const app = express();
const sql = require("mssql");
const cors = require('cors')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
require("dotenv").config()
const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')
const employeeRouter = require('./routes/NguoiTimViec')
const companyRouter = require('./routes/Company')
const addressRouter = require('./routes/address')
const fileRouter = require('./routes/extractFile')
const cheDoRouter = require('./routes/chedo')
const viTriTuyenDungRouter = require('./routes/viTriTuyenDung')
const danhMucRouter = require('./routes/catergory')

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "Web tuyển dụng API"
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                BearerAuth: []
            }
        ],
        servers: [
            {
                url: "http://localhost:5000"
            }
        ],
    },
    apis:["./routes/*.js"]
} 


const specs = swaggerJsDoc(options)
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))

const connectDb = async() =>{

    try {
        const config = {
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            synchronize: true,
            trustServerCertificate: true,
        };
        await sql.connect(config);
        console.log("DbConnected");
    } catch (err) {
        console.log(err);
    }
}
connectDb()
app.use(cors())
app.use(express.json());

app.use('/api/auth', authRouter)
app.use('/api/post', postRouter)
app.use('/api/user', employeeRouter)
app.use('/api/ntd', companyRouter)
app.use('/api/address', addressRouter)
app.use('/api/file', fileRouter)
app.use('/api/chedo', cheDoRouter)
app.use('/api/vttd', viTriTuyenDungRouter)
app.use('/api/danhmuc',danhMucRouter)




app.listen(5000, () => {
    console.log('Server is running..');
});
