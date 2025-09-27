import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

const router = Router();

// User authentication routes
router.get('/user-login', (req, res) => {
	res.render('auth/user-login');
});

router.post('/user-login', (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) return next(err);
		if (!user) {
			req.flash('error', info.message);
			return res.redirect('/auth/user-login');
		}
		if (user.role !== 'player') {
			req.flash('error', 'This is for users only. Please use admin login.');
			return res.redirect('/auth/user-login');
		}
		req.logIn(user, (err) => {
			if (err) return next(err);
			return res.redirect('/');
		});
	})(req, res, next);
});

router.get('/user-signup', (req, res) => {
	res.render('auth/user-signup');
});

router.post('/user-signup', async (req, res) => {
	const { name, email, password } = req.body;
	try {
		const existing = await User.findOne({ email });
		if (existing) {
			req.flash('error', 'Email already registered');
			return res.redirect('/auth/user-signup');
		}
		const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, passwordHash, role: 'player' });
        console.log('New user created (player):', newUser);
		req.flash('success', 'Account created. Please login.');
		res.redirect('/auth/user-login');
	} catch (e) {
		console.error('Signup error:', e);
		req.flash('error', 'Could not sign up');
		res.redirect('/auth/user-signup');
	}
});

// Admin authentication routes
router.get('/admin-login', (req, res) => {
	res.render('auth/admin-login');
});

router.post('/admin-login', (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) return next(err);
		if (!user) {
			req.flash('error', info.message);
			return res.redirect('/auth/admin-login');
		}
		if (user.role !== 'admin') {
			req.flash('error', 'This is for admins only. Please use user login.');
			return res.redirect('/auth/admin-login');
		}
		req.logIn(user, (err) => {
			if (err) return next(err);
			return res.redirect('/');
		});
	})(req, res, next);
});

router.get('/admin-signup', (req, res) => {
	res.render('auth/admin-signup');
});

router.post('/admin-signup', async (req, res) => {
	const { name, email, password, adminCode } = req.body;
	try {
		// Check admin code (you can change this to a more secure method)
		if (adminCode !== 'ADMIN2024') {
			req.flash('error', 'Invalid admin code');
			return res.redirect('/auth/admin-signup');
		}

		const existing = await User.findOne({ email });
		if (existing) {
			req.flash('error', 'Email already registered');
			return res.redirect('/auth/admin-signup');
		}
		const passwordHash = await bcrypt.hash(password, 10);
        const newAdmin = await User.create({ name, email, passwordHash, role: 'admin' });
        console.log('New user created (admin):', newAdmin);
		req.flash('success', 'Admin account created. Please login.');
		res.redirect('/auth/admin-login');
	} catch (e) {
		console.error('Admin signup error:', e);
		req.flash('error', 'Could not create admin account');
		res.redirect('/auth/admin-signup');
	}
});

// Legacy routes for backward compatibility
router.get('/login', (req, res) => {
	res.redirect('/auth/user-login');
});

router.get('/signup', (req, res) => {
	res.redirect('/auth/user-signup');
});

router.post('/logout', (req, res, next) => {
	req.logout(err => {
		if (err) return next(err);
		res.redirect('/');
	});
});

export default router;



