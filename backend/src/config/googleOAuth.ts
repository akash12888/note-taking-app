import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User from '../models/User';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: Error | null, user?: any) => void
    ) => {
      try {
        console.log('Google OAuth: Received profile', {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
        });

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('Existing user found by Google ID:', user.email);
          return done(null, user);
        }

        const email = profile.emails?.[0]?.value;

        if (!email) {
          const errorMsg = 'No email found in Google profile.';
          console.error(errorMsg);
          return done(new Error(errorMsg));
        }

        user = await User.findOne({ email });

        if (user) {
          console.log('User found by email. Linking Google ID:', profile.id);
          user.googleId = profile.id;
          user.isVerified = true;
          user.updatedAt = new Date();

          await user.save();

          console.log('User updated successfully with Google ID.');
          return done(null, user);
        }

        console.log('No existing user found. Creating a new user.');

        const newUser = new User({
          name: profile.displayName,
          email,
          googleId: profile.id,
          isVerified: true,
        });

        await newUser.save();

        console.log('New user created successfully.');
        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  console.log('Serializing user ID:', user._id);
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    console.log('Deserializing user ID:', id);
    const user = await User.findById(id);

    if (user) {
      console.log('User deserialized successfully:', user.email);
    } else {
      console.warn('User not found during deserialization:', id);
    }

    done(null, user);
  } catch (error) {
    console.error('Deserialization error:', error);
    done(error as Error);
  }
});
