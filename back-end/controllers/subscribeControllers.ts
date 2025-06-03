import nodemailer from "nodemailer";
import pool from "../config/connectDb";
import { Request, Response, NextFunction } from "express";

const subscribeToNewsletter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Check if the email is already subscribed
    const subscriberResult = await pool.query(
      "SELECT * FROM subscribers WHERE email = $1",
      [email]
    );
    const subscriber = subscriberResult.rows[0];

    if (subscriber) {
      return res.status(400).json({
        message: "You are already subscribed",
        data: null,
      });
    }

    // Add the email to the subscribers table
    await pool.query("INSERT INTO subscribers (email) VALUES ($1)", [email]);

    //

    const transporter = nodemailer.createTransport({
      // host: "smtp.ethereal.email",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS_KEY,
      },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL, // sender address
      to: email, // list of receivers
      subject: "Estatery Subscription ✔", // Subject line
      text: "you successfully subscribed we gonna email with the latest news of our app", // plain text body
      html: "<b>thanks for joining us</b>", // html body
    });
    //

    return res.status(200).json({
      message: "Subscription successful check your email for confirmation",
      data: null,
    });
  } catch (error) {
    next(error);
    return;
  }
};

export { subscribeToNewsletter };
