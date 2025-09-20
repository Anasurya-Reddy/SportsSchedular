import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireUser } from '../middleware/roleAuth.js';
import { User, Session, Sport, SessionPlayer } from '../models/index.js';

const router = Router();

// Apply authentication and user role middleware to all routes
router.use(requireAuth);
router.use(requireUser);

// User Dashboard
router.get('/dashboard', async (req, res) => {
	try {
		const now = new Date();
		
		// Get available sessions
		const availableSessions = await Session.find({
			status: 'scheduled',
			startsAt: { $gt: now }
		})
		.populate('sportId', 'name')
		.populate('createdById', 'name')
		.sort({ startsAt: 1 })
		.limit(5);

		// Get user's requests
		const userRequests = await SessionPlayer.find({ userId: req.user._id })
			.populate('sessionId')
			.populate({
				path: 'sessionId',
				populate: {
					path: 'sportId',
					select: 'name'
				}
			})
			.sort({ requestedAt: -1 })
			.limit(5);

		// Get approved sessions
		const approvedSessions = await SessionPlayer.find({ 
			userId: req.user._id, 
			status: 'approved' 
		})
		.populate('sessionId')
		.populate({
			path: 'sessionId',
			populate: {
				path: 'sportId',
				select: 'name'
			}
		})
		.sort({ approvedAt: -1 })
		.limit(5);

		// Statistics
		const totalRequests = await SessionPlayer.countDocuments({ userId: req.user._id });
		const approvedRequests = await SessionPlayer.countDocuments({ 
			userId: req.user._id, 
			status: 'approved' 
		});
		const pendingRequests = await SessionPlayer.countDocuments({ 
			userId: req.user._id, 
			status: 'pending' 
		});

		res.render('user/dashboard', {
			user: req.user,
			availableSessions,
			userRequests,
			approvedSessions,
			stats: {
				totalRequests,
				approvedRequests,
				pendingRequests
			}
		});
	} catch (error) {
		console.error('Error loading user dashboard:', error);
		req.flash('error', 'Error loading dashboard');
		res.redirect('/');
	}
});

// User Sessions
router.get('/sessions', async (req, res) => {
	try {
		const now = new Date();
		const available = await Session.find({
			status: 'scheduled',
			startsAt: { $gt: now }
		}).populate('sportId', 'name').sort({ startsAt: 1 });

		const joinedSessions = await SessionPlayer.find({ userId: req.user._id })
			.populate('sessionId')
			.populate('userId', 'name');

		const joined = joinedSessions.map(sp => sp.sessionId).filter(session => session);

		res.render('user/sessions', { available, joined });
	} catch (error) {
		console.error('Error fetching sessions:', error);
		req.flash('error', 'Error fetching sessions');
		res.redirect('/user/dashboard');
	}
});

// User Requests
router.get('/requests', async (req, res) => {
	try {
		const userRequests = await SessionPlayer.find({ userId: req.user._id })
			.populate('sessionId')
			.populate({
				path: 'sessionId',
				populate: {
					path: 'sportId',
					select: 'name'
				}
			})
			.sort({ requestedAt: -1 });

		res.render('user/requests', { userRequests });
	} catch (error) {
		console.error('Error fetching user requests:', error);
		req.flash('error', 'Error fetching your requests');
		res.redirect('/user/dashboard');
	}
});

// User Profile
router.get('/profile', (req, res) => {
	res.render('user/profile', { user: req.user });
});

router.post('/profile', async (req, res) => {
	try {
		const { name, email } = req.body;
		const user = await User.findById(req.user._id);
		
		// Check if email is already taken by another user
		if (email !== user.email) {
			const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
			if (existingUser) {
				req.flash('error', 'Email already taken');
				return res.redirect('/user/profile');
			}
		}

		user.name = name;
		user.email = email;
		await user.save();

		req.flash('success', 'Profile updated successfully');
		res.redirect('/user/profile');
	} catch (error) {
		console.error('Error updating profile:', error);
		req.flash('error', 'Error updating profile');
		res.redirect('/user/profile');
	}
});

export default router;
