import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { Session, Sport, User, SessionPlayer } from '../models/index.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
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
				return {
					name: sport.name,
					sessionCount
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

		res.render('reports/index', {
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
		res.redirect('/');
	}
});

export default router;
