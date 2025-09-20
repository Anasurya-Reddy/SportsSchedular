import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { User, Session, Sport, SessionPlayer } from '../models/index.js';

const router = Router();

// Apply authentication and admin role middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// Admin Dashboard
router.get('/dashboard', async (req, res) => {
	try {
		// Get recent statistics
		const totalUsers = await User.countDocuments();
		const totalAdmins = await User.countDocuments({ role: 'admin' });
		const totalPlayers = await User.countDocuments({ role: 'player' });
		const totalSessions = await Session.countDocuments();
		const activeSessions = await Session.countDocuments({ status: 'scheduled' });
		const totalSports = await Sport.countDocuments();

		// Get pending requests
		const pendingRequests = await SessionPlayer.find({ status: 'pending' })
			.populate('userId', 'name email')
			.populate('sessionId')
			.populate({
				path: 'sessionId',
				populate: {
					path: 'sportId',
					select: 'name'
				}
			})
			.sort({ requestedAt: -1 })
			.limit(10);

		// Get recent sessions
		const recentSessions = await Session.find()
			.populate('sportId', 'name')
			.populate('createdById', 'name')
			.sort({ createdAt: -1 })
			.limit(5);

		// Get popular sports
		const sports = await Sport.find();
		const sportStats = await Promise.all(
			sports.map(async (sport) => {
				const sessionCount = await Session.countDocuments({ sportId: sport._id });
				const requestCount = await SessionPlayer.countDocuments({ 
					'sessionId.sportId': sport._id 
				});
				return {
					name: sport.name,
					sessionCount,
					requestCount
				};
			})
		);

		res.render('admin/dashboard', {
			admin: req.user,
			pendingRequests,
			recentSessions,
			sportStats,
			stats: {
				users: { total: totalUsers, admins: totalAdmins, players: totalPlayers },
				sessions: { total: totalSessions, active: activeSessions },
				sports: totalSports,
				requests: pendingRequests.length
			}
		});
	} catch (error) {
		console.error('Error loading admin dashboard:', error);
		req.flash('error', 'Error loading dashboard');
		res.redirect('/');
	}
});

// Admin Sessions Management
router.get('/sessions', async (req, res) => {
	try {
		const sessions = await Session.find()
			.populate('sportId', 'name')
			.populate('createdById', 'name')
			.sort({ startsAt: -1 });

		res.render('admin/sessions', { sessions });
	} catch (error) {
		console.error('Error fetching sessions:', error);
		req.flash('error', 'Error fetching sessions');
		res.redirect('/admin/dashboard');
	}
});

// Admin Sports Management
router.get('/sports', async (req, res) => {
	try {
		const sports = await Sport.find()
			.populate('createdById', 'name')
			.sort({ createdAt: -1 });

		res.render('admin/sports', { sports });
	} catch (error) {
		console.error('Error fetching sports:', error);
		req.flash('error', 'Error fetching sports');
		res.redirect('/admin/dashboard');
	}
});

// Admin Requests Management
router.get('/requests', async (req, res) => {
	try {
		const pendingRequests = await SessionPlayer.find({ status: 'pending' })
			.populate('userId', 'name email')
			.populate('sessionId')
			.populate({
				path: 'sessionId',
				populate: {
					path: 'sportId',
					select: 'name'
				}
			})
			.sort({ requestedAt: -1 });

		const approvedRequests = await SessionPlayer.find({ status: 'approved' })
			.populate('userId', 'name email')
			.populate('sessionId')
			.populate({
				path: 'sessionId',
				populate: {
					path: 'sportId',
					select: 'name'
				}
			})
			.sort({ approvedAt: -1 });

		const rejectedRequests = await SessionPlayer.find({ status: 'rejected' })
			.populate('userId', 'name email')
			.populate('sessionId')
			.populate({
				path: 'sessionId',
				populate: {
					path: 'sportId',
					select: 'name'
				}
			})
			.sort({ updatedAt: -1 });

		res.render('admin/requests', {
			pendingRequests,
			approvedRequests,
			rejectedRequests
		});
	} catch (error) {
		console.error('Error fetching requests:', error);
		req.flash('error', 'Error fetching requests');
		res.redirect('/admin/dashboard');
	}
});

// Admin Users Management
router.get('/users', async (req, res) => {
	try {
		const users = await User.find()
			.sort({ createdAt: -1 });

		const userStats = {
			total: await User.countDocuments(),
			admins: await User.countDocuments({ role: 'admin' }),
			players: await User.countDocuments({ role: 'player' })
		};

		res.render('admin/users', { users, userStats });
	} catch (error) {
		console.error('Error fetching users:', error);
		req.flash('error', 'Error fetching users');
		res.redirect('/admin/dashboard');
	}
});

// Admin Reports
router.get('/reports', async (req, res) => {
	try {
		// Get session statistics
		const totalSessions = await Session.countDocuments();
		const activeSessions = await Session.countDocuments({ status: 'scheduled' });
		const cancelledSessions = await Session.countDocuments({ status: 'cancelled' });
		const completedSessions = await Session.countDocuments({ status: 'completed' });

		// Get sport statistics
		const sports = await Sport.find();
		const sportStats = await Promise.all(
			sports.map(async (sport) => {
				const sessionCount = await Session.countDocuments({ sportId: sport._id });
				const requestCount = await SessionPlayer.countDocuments({ 
					'sessionId.sportId': sport._id 
				});
				return {
					name: sport.name,
					sessionCount,
					requestCount
				};
			})
		);

		// Get user statistics
		const totalUsers = await User.countDocuments();
		const adminUsers = await User.countDocuments({ role: 'admin' });
		const playerUsers = await User.countDocuments({ role: 'player' });

		// Get recent sessions
		const recentSessions = await Session.find()
			.populate('sportId', 'name')
			.populate('createdById', 'name')
			.sort({ createdAt: -1 })
			.limit(10);

		res.render('admin/reports', {
			stats: {
				sessions: {
					total: totalSessions,
					active: activeSessions,
					cancelled: cancelledSessions,
					completed: completedSessions
				},
				users: {
					total: totalUsers,
					admins: adminUsers,
					players: playerUsers
				},
				sports: sportStats
			},
			recentSessions
		});
	} catch (error) {
		console.error('Error generating reports:', error);
		req.flash('error', 'Error generating reports');
		res.redirect('/admin/dashboard');
	}
});

export default router;
