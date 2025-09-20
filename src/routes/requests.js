import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { SessionPlayer, Session, User, Sport } from '../models/index.js';

const router = Router();

// Admin route to view all pending requests
router.get('/', requireAuth, requireAdmin, async (req, res) => {
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

		res.render('requests/admin-index', {
			pendingRequests,
			approvedRequests,
			rejectedRequests
		});
	} catch (error) {
		console.error('Error fetching requests:', error);
		req.flash('error', 'Error fetching requests');
		res.redirect('/');
	}
});

// User route to view their own requests
router.get('/my', requireAuth, async (req, res) => {
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

		res.render('requests/user-index', { userRequests });
	} catch (error) {
		console.error('Error fetching user requests:', error);
		req.flash('error', 'Error fetching your requests');
		res.redirect('/');
	}
});

// Admin route to approve a request
router.post('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
	try {
		const request = await SessionPlayer.findById(req.params.id)
			.populate('sessionId')
			.populate('userId');

		if (!request) {
			req.flash('error', 'Request not found');
			return res.redirect('/requests');
		}

		if (request.status !== 'pending') {
			req.flash('error', 'Request is not pending');
			return res.redirect('/requests');
		}

		request.status = 'approved';
		request.approvedAt = new Date();
		request.approvedBy = req.user._id;
		await request.save();

		req.flash('success', `Request from ${request.userId.name} approved successfully`);
		res.redirect('/requests');
	} catch (error) {
		console.error('Error approving request:', error);
		req.flash('error', 'Error approving request');
		res.redirect('/requests');
	}
});

// Admin route to reject a request
router.post('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
	try {
		const request = await SessionPlayer.findById(req.params.id)
			.populate('sessionId')
			.populate('userId');

		if (!request) {
			req.flash('error', 'Request not found');
			return res.redirect('/requests');
		}

		if (request.status !== 'pending') {
			req.flash('error', 'Request is not pending');
			return res.redirect('/requests');
		}

		request.status = 'rejected';
		request.approvedBy = req.user._id;
		await request.save();

		req.flash('success', `Request from ${request.userId.name} rejected`);
		res.redirect('/requests');
	} catch (error) {
		console.error('Error rejecting request:', error);
		req.flash('error', 'Error rejecting request');
		res.redirect('/requests');
	}
});

// User route to cancel their own request
router.post('/:id/cancel', requireAuth, async (req, res) => {
	try {
		const request = await SessionPlayer.findById(req.params.id);

		if (!request) {
			req.flash('error', 'Request not found');
			return res.redirect('/requests/my');
		}

		if (request.userId.toString() !== req.user._id.toString()) {
			req.flash('error', 'You can only cancel your own requests');
			return res.redirect('/requests/my');
		}

		if (request.status !== 'pending') {
			req.flash('error', 'Only pending requests can be cancelled');
			return res.redirect('/requests/my');
		}

		await SessionPlayer.findByIdAndDelete(req.params.id);

		req.flash('success', 'Request cancelled successfully');
		res.redirect('/requests/my');
	} catch (error) {
		console.error('Error cancelling request:', error);
		req.flash('error', 'Error cancelling request');
		res.redirect('/requests/my');
	}
});

export default router;
