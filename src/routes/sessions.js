import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Session, Sport, SessionPlayer, User } from '../models/index.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
	try {
		const now = new Date();
		const available = await Session.find({
			status: 'scheduled',
			startsAt: { $gt: now }
		}).populate('sportId', 'name').sort({ startsAt: 1 });

		const mine = await Session.find({ createdById: req.user._id })
			.populate('sportId', 'name')
			.sort({ startsAt: 1 });

		const joinedSessions = await SessionPlayer.find({ userId: req.user._id })
			.populate('sessionId')
			.populate('userId', 'name');

		const joined = joinedSessions.map(sp => sp.sessionId).filter(session => session);

		res.render('sessions/index', { available, mine, joined });
	} catch (error) {
		console.error('Error fetching sessions:', error);
		req.flash('error', 'Error fetching sessions');
		res.redirect('/');
	}
});

router.get('/new', requireAuth, async (req, res) => {
	try {
		const sports = await Sport.find().sort({ name: 1 });
		console.log('Fetched sports:', sports.length, 'sports found');
		res.render('sessions/new', { sports });
	} catch (error) {
		console.error('Error fetching sports:', error);
		req.flash('error', 'Error fetching sports');
		res.redirect('/sessions');
	}
});

router.post('/', requireAuth, async (req, res) => {
	try {
		const { sportId, startsAt, venue, lookingForCount } = req.body;
		await Session.create({
			sportId,
			startsAt: new Date(startsAt),
			venue,
			lookingForCount: parseInt(lookingForCount) || 0,
			createdById: req.user._id
		});
		req.flash('success', 'Session created successfully');
		res.redirect('/sessions');
	} catch (error) {
		console.error('Error creating session:', error);
		req.flash('error', 'Error creating session');
		res.redirect('/sessions/new');
	}
});

router.get('/:id', requireAuth, async (req, res) => {
	try {
		const session = await Session.findById(req.params.id).populate('sportId', 'name');
		if (!session) return res.status(404).render('404');

		const participants = await SessionPlayer.find({ sessionId: session._id })
			.populate('userId', 'name email');

		res.render('sessions/show', { session, participants });
	} catch (error) {
		console.error('Error fetching session:', error);
		req.flash('error', 'Error fetching session');
		res.redirect('/sessions');
	}
});

router.post('/:id/join', requireAuth, async (req, res) => {
	try {
		// Check if user is a player (not admin)
		if (req.user.role !== 'player') {
			req.flash('error', 'Only players can request to join sessions');
			return res.redirect(`/sessions/${req.params.id}`);
		}

		const session = await Session.findById(req.params.id);
		if (!session) return res.status(404).render('404');

		if (session.status === 'cancelled') {
			req.flash('error', 'Cannot join cancelled sessions');
			return res.redirect('/sessions');
		}

		if (new Date(session.startsAt) <= new Date()) {
			req.flash('error', 'Cannot join past sessions');
			return res.redirect('/sessions');
		}

		// Check if user is already requested or joined
		const existingPlayer = await SessionPlayer.findOne({
			sessionId: session._id,
			userId: req.user._id
		});

		if (existingPlayer) {
			if (existingPlayer.status === 'pending') {
				req.flash('error', 'You have already requested to join this session. Please wait for approval.');
			} else if (existingPlayer.status === 'approved') {
				req.flash('error', 'You are already approved for this session');
			} else if (existingPlayer.status === 'rejected') {
				req.flash('error', 'Your request to join this session was rejected');
			}
			return res.redirect(`/sessions/${session._id}`);
		}

		// Create join request
		await SessionPlayer.create({
			sessionId: session._id,
			userId: req.user._id,
			teamSlot: null,
			status: 'pending'
		});

		req.flash('success', 'Join request submitted successfully. Please wait for admin approval.');
		res.redirect(`/sessions/${session._id}`);
	} catch (error) {
		console.error('Error joining session:', error);
		req.flash('error', 'Error joining session');
		res.redirect('/sessions');
	}
});

router.post('/:id/cancel', requireAuth, async (req, res) => {
	try {
		// Check if user is admin
		if (req.user.role !== 'admin') {
			req.flash('error', 'Only administrators can cancel sessions');
			return res.redirect(`/sessions/${req.params.id}`);
		}

		const session = await Session.findById(req.params.id);
		if (!session) return res.status(404).render('404');

		if (session.status === 'cancelled') {
			req.flash('error', 'Session is already cancelled');
			return res.redirect(`/sessions/${session._id}`);
		}

		session.status = 'cancelled';
		session.cancelReason = req.body.reason || 'Cancelled by admin';
		await session.save();

		req.flash('success', 'Session cancelled successfully');
		res.redirect(`/sessions/${session._id}`);
	} catch (error) {
		console.error('Error cancelling session:', error);
		req.flash('error', 'Error cancelling session');
		res.redirect(`/sessions/${req.params.id}`);
	}
});

export default router;



