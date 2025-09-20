import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Sport, User } from '../src/models/index.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sports-scheduler');
		console.log('MongoDB connected successfully');
	} catch (error) {
		console.error('MongoDB connection error:', error.message);
		process.exit(1);
	}
};

const seedData = async () => {
	try {
		// Create admin user if not exists
		let adminUser = await User.findOne({ email: 'admin@sports.com' });
		if (!adminUser) {
			const passwordHash = await bcrypt.hash('admin123', 10);
			adminUser = await User.create({
				name: 'Admin User',
				email: 'admin@sports.com',
				passwordHash,
				role: 'admin'
			});
			console.log('Admin user created');
		}

		// Create sample sports
		const sports = [
			'Football',
			'Basketball',
			'Tennis',
			'Volleyball',
			'Badminton',
			'Cricket',
			'Baseball',
			'Hockey'
		];

		for (const sportName of sports) {
			const existingSport = await Sport.findOne({ name: sportName });
			if (!existingSport) {
				await Sport.create({
					name: sportName,
					createdById: adminUser._id
				});
				console.log(`Created sport: ${sportName}`);
			}
		}

		console.log('Seeding completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('Seeding error:', error);
		process.exit(1);
	}
};

connectDB().then(() => {
	seedData();
});
