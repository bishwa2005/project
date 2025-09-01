import 'dotenv/config';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from './db.js';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('Missing Google OAuth env vars: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails, photos } = profile;
      const email = emails[0].value;
      const photo = photos[0].value;

      try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (user) {
          done(null, user);
        } else {
          const newUserQuery = `INSERT INTO users (name, email, password, domain, profile_picture) 
                                VALUES ($1, $2, $3, $4, $5) RETURNING *`;
          const newUser = await db.query(newUserQuery, [displayName, email, 'google_auth_user', 'Not Specified', photo]);
          done(null, newUser.rows[0]);
        }
      } catch (err) {
        done(err, null);
      }
    }
  )
);