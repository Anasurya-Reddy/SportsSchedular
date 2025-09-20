import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { User, Session, Sport, SessionPlayer } from '../models/index.js';

const router = Router();

// Public routes (no authentication required)
router.get('/', (req, res) => {
	if (req.isAuthenticated()) {
		// Redirect to appropriate dashboard based on user role
		if (req.user.role === 'admin') {
			return res.redirect('/admin/dashboard');
		} else {
			return res.redirect('/user/dashboard');
		}
	}
	res.render('public/home');
});

router.get('/about', (req, res) => {
	res.render('public/about');
});

router.get('/features', (req, res) => {
	res.render('public/features');
});

// Dashboard routes with role-based access
router.get('/dashboard', requireAuth, (req, res) => {
	if (req.user.role === 'admin') {
		res.redirect('/admin/dashboard');
	} else {
		res.redirect('/user/dashboard');
	}
});

export default router;
