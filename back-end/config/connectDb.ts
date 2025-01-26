    import {Pool} from 'pg'

    const pool = new Pool({
        
        connectionString : process.env.DATABASE_PROD_URL,
        // user: process.env.DB_USER || "postgres",
        // host: process.env.DB_HOST || "localhost",
        // database : process.env.DB_NAME || "postgres",
        // password : process.env.DB_PASSWORD || "", 
        // port : process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432 

    })


    const connectToDB = async () => {
        try {
            pool.connect()
            console.log("connected successfully to Database ")
            pool.query("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(50), email VARCHAR(50), password VARCHAR(50), role VARCHAR(50), refreshToken VARCHAR(50))")

            
        } catch (error) {
            console.log("connection failed to DB",error)
        }
    }



    export default pool
    export {connectToDB}



