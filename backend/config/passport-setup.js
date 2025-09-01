import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from './db.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: '500244787088-fgfg5vmhaqgmnrmmdks4oc27vuftmq7o.apps.googleusercontent.com',       // From Google Console
      clientSecret: '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', // From Google Console
      callbackURL: '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      // This function is called after a user authenticates with Google
      const { id, displayName, emails, photos } = profile;
      const email = emails[0].value;
      const photo = photos[0].value;

      try {
        // Check if user already exists in your database
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (user) {
          // User exists, pass them to the next step
          done(null, user);
        } else {
          // User doesn't exist, create a new user in your database
          const newUserQuery = `INSERT INTO users (name, email, password, domain, profile_picture) 
                                VALUES ($1, $2, $3, $4, $5) RETURNING *`;
          // We use a placeholder password as they won't use it to log in
          const newUser = await db.query(newUserQuery, [displayName, email, 'google_auth_user', 'Not Specified', photo]);
          done(null, newUser.rows[0]);
        }
      } catch (err) {
        done(err, null);
      }
    }
  )
);