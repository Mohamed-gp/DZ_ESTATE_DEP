import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "../config/connectDb";
import { encrypt } from "../utils/encryption";
import jwt from "jsonwebtoken"

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        const username = profile.displayName;
        const googleId = profile.id;
        const profileImage = profile.photos?.[0].value;

        if (!email) {
          return done(null, false, { message: "No email found" });
        }

        let user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rowCount === 0) {
          // Create a new user if not found
          user = await pool.query(
            "INSERT INTO users (username, email, provider, profile_image) VALUES ($1, $2, $3, $4) RETURNING *",
            [username, email, "google", profileImage]
          );
        }

        const accessToken = jwt.sign({ id: user.rows[0].id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: user.rows[0].id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
        const encryptedRefreshToken = encrypt(refreshToken);

        // i should store the refresh token in new database table user_refresh_tokens to ensure he can access his account from different devices
        // await pool.query("INSERT INTO user_refresh_tokens (user_id, refresh_token) VALUES ($1, $2)", [user.rows[0].id, encryptedRefreshToken]);
        await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [encryptedRefreshToken, user.rows[0].id]);


        return done(null, { user: user.rows[0], accessToken, refreshToken: encryptedRefreshToken });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;