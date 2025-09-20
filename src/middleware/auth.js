export function requireAuth(req, res, next) {
	if (req.isAuthenticated && req.isAuthenticated()) return next();
	req.flash('error', 'Please sign in');
	return res.redirect('/auth/login');
}

export function requireAdmin(req, res, next) {
	if (req.user && req.user.role === 'admin') return next();
	return res.status(401).render('401');
}



