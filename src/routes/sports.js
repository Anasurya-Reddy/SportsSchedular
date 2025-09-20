import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { Sport } from '../models/index.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
	try {
		const sports = await Sport.find().populate('createdById', 'name').sort({ createdAt: -1 });
		res.render('sports/index', { sports });
	} catch (error) {
		console.error('Error fetching sports:', error);
		req.flash('error', 'Error fetching sports');
		res.redirect('/');
	}
});

router.get('/new', requireAuth, requireAdmin, (req, res) => {
	res.render('sports/new');
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
	try {
		const { name } = req.body;
		await Sport.create({ name, createdById: req.user._id });
		req.flash('success', 'Sport created successfully');
		res.redirect('/sports');
	} catch (error) {
		console.error('Error creating sport:', error);
		req.flash('error', 'Error creating sport');
		res.redirect('/sports/new');
	}
});

router.get('/:id/edit', requireAuth, requireAdmin, async (req, res) => {
	try {
		const sport = await Sport.findById(req.params.id);
		if (!sport) return res.status(404).render('404');
		res.render('sports/edit', { sport });
	} catch (error) {
		console.error('Error fetching sport:', error);
		req.flash('error', 'Error fetching sport');
		res.redirect('/sports');
	}
});

router.post('/:id', requireAuth, requireAdmin, async (req, res) => {
	try {
		const sport = await Sport.findById(req.params.id);
		if (!sport) return res.status(404).render('404');
		sport.name = req.body.name;
		await sport.save();
		req.flash('success', 'Sport updated successfully');
		res.redirect('/sports');
	} catch (error) {
		console.error('Error updating sport:', error);
		req.flash('error', 'Error updating sport');
		res.redirect(`/sports/${req.params.id}/edit`);
	}
});

export default router;



