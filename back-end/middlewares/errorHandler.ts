import { Request, Response, NextFunction } from 'express';

const notFound = (req:Request,res : Response,next: NextFunction) => {
    const err = new Error(`not Found - ${req.originalUrl}`);
    res.status(404)
    next(err);

}

const errorHandler = (err :Error,req:Request,res:Response,next:NextFunction)=>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({message : err.message,stack : process.env.NODE_ENV === 'production' ? null : err.stack});
}

export {notFound, errorHandler}