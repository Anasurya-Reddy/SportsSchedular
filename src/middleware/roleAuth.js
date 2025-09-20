export function requireUser(req, res, next) {
	if (req.user && req.user.role === 'player') {
		return next();
	}
	req.flash('error', 'Access denied. User role required.');
	res.redirect('/auth/user-login');
}

export function requireAdmin(req, res, next) {
	if (req.user && req.user.role === 'admin') {
		return next();
	}
	req.flash('error', 'Access denied. Admin role required.');
	res.redirect('/auth/admin-login');
}
