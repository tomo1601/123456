const express = require('express')
const app = express();
const sql = require("mssql");
const cors = require('cors')
require("dotenv").config()
const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')
const employeeRouter = require('./routes/NguoiTimViec')
const companyRouter = require('./routes/Company')

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


app.listen(5000, () => {
    console.log('Server is running..');
});