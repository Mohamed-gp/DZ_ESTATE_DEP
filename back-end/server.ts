import dotenv from "dotenv"
dotenv.config();
import express,{Response}  from "express"
import {connectToDB} from "./config/connectDb";
import router from "./routes/index";
import  cookiesParser from "cookie-parser";
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimiting from "express-rate-limit";
import { socketServer } from "./socket/socket.js";
import { errorHandler, notFound } from "./middlewares/errorHandler";










export const app = express();

// const io = socketServer(server);
// app.use((req, res, next) => {
//   res.io = io;
//   next();
// });

app.use(hpp());

// // security headers
app.use(helmet());
// // prevent xss attack

app.use(xss());

app.use(
  rateLimiting({
    windowMs: 10 * 60 * 1000,
    max: 500,
  })
);



const PORT = process.env.PORT || 2000;
const corsOptions = {
  // never do / in the last of the url
    origin: process.env.NODE_ENV === "production" ? process.env.FRONT_END_PROD_URL : process.env.FRONT_END_DEV_URL ,
    
    credentials: true,
}

app.use(cors(corsOptions));
app.use(cookiesParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
connectToDB()


app.use("/api",router);

app.get('/', (_, res: Response) => {
    res.json({data: 'Hello From DZ ESTATE Server!', status: 200});
});
app.listen(PORT, () => {
    console.log(`app listening at ${PORT}`);
});


app.use(notFound);
app.use(errorHandler);