import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

passport.use(
	new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
		try {
			const user = await User.findOne({ email });
			if (!user) return done(null, false, { message: 'Invalid email or password' });
			const ok = await bcrypt.compare(password, user.passwordHash);
			if (!ok) return done(null, false, { message: 'Invalid email or password' });
			return done(null, user);
		} catch (err) {
			return done(err);
		}
	})
);

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (err) {
		done(err);
	}
});

export default passport;



