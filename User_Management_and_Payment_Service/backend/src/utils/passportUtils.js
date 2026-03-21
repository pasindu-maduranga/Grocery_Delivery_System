const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/UserModel');
const generateAccessToken = require('./generateToken');

passport.use(
    new googleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async(accessToken, refreshToken, profile, done) => {
            try{
                //find an existing user by email
                let user = await User.findOne({ 
                    $or: [
                        { googleId: profile.id },
                        { email: profile.emails[0].value }
                    ]
                });

                //if user is not found, create a new user
                if(!user){
                    user = new User({
                        googleId: profile.id,    
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        avatar: profile.photos?.[0]?.value || '',
                        role: 'customer',
                        isVerified: true,  //auto-verify after Google confirmed
                        // password: undefined,  //no password for OAuth users
                    });
                    await user.save();
                }else if (!user.googleId) {
                    //link googleId to existing email account
                    user.googleId = profile.id;
                    await user.save();
                }

                const token = generateAccessToken(user);

                return done(
                    null, 
                    { user, token }
                );
            }catch(error){
                return done(
                    error,
                    null
                );
            }
        }
    )
);

// Serialize/deserialize for sessions
passport.serializeUser((data, done) => done(null, data.user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports= passport;
