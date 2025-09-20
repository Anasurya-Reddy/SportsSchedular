import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import dotenv from 'dotenv';
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';

import './config/passport.js';
import { initDb } from './models/index.js';
import indexRoutes from './routes/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import sportsRoutes from './routes/sports.js';
import sessionsRoutes from './routes/sessions.js';
import reportsRoutes from './routes/reports.js';
import requestsRoutes from './routes/requests.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(
	session({
		secret: process.env.SESSION_SECRET || 'change-me',
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 1000 * 60 * 60 * 24 }
	})
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.flash = {
		success: req.flash('success'),
		error: req.flash('error')
	};
	next();
});

// Main routes
app.use('/', indexRoutes);

// Authentication routes
app.use('/auth', authRoutes);

// User dashboard routes
app.use('/user', userRoutes);

// Admin dashboard routes
app.use('/admin', adminRoutes);

// Legacy routes (for backward compatibility)
app.use('/sports', sportsRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/reports', reportsRoutes);
app.use('/requests', requestsRoutes);

app.use((req, res) => {
	res.status(404).render('404');
});

const port = process.env.PORT || 3000;

initDb().then(() => {
	app.listen(port, () => {
		console.log(`Server running on http://localhost:${port}`);
	});
}).catch((error) => {
	console.error('Failed to start server:', error.message);
	console.log('\nTo fix this issue:');
	console.log('1. Install MongoDB Community Server from: https://www.mongodb.com/try/download/community');
	console.log('2. Start MongoDB service: mongod');
	console.log('3. Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env file');
	process.exit(1);
});



