import { Request, Response } from 'express';
import pool from '../config/connectDb';

const getNotificationsController = async (req: Request, res: Response) => {
        try {
            const { id } = req.body;
            console.log("user_id form the get notication contorller ", id);
            const getNotifications = await pool.query('SELECT * FROM notifications WHERE user_id = $1', [id]);
            console.log("getNotifications", getNotifications.rows);
            res.send( getNotifications.rows);
        } catch (error) {
            console.log(error.message);
        }
    }





 const createNotification = async ( req:Request , res:Response) => {
    try {
        const {id , type ,  message} = req.body;
        console.log("creating notification" , id , type , message)
        const createNotification = await pool.query('INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3) RETURNING *', [id, type, message]);
        return createNotification.rows[0];
        res.send("notification created successfully");
    } catch (error) {
        console.log(error.message);
    }
}



export { getNotificationsController , createNotification};

