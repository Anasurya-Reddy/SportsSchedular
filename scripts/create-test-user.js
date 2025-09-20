import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/index.js';
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

const createTestUser = async () => {
	try {
		// Create test user if not exists
		let testUser = await User.findOne({ email: 'test@example.com' });
		if (!testUser) {
			const passwordHash = await bcrypt.hash('test123', 10);
			testUser = await User.create({
				name: 'Test User',
				email: 'test@example.com',
				passwordHash,
				role: 'player'
			});
			console.log('Test user created:');
			console.log('Email: test@example.com');
			console.log('Password: test123');
		} else {
			console.log('Test user already exists:');
			console.log('Email: test@example.com');
			console.log('Password: test123');
		}

		console.log('Test user setup completed!');
		process.exit(0);
	} catch (error) {
		console.error('Error creating test user:', error);
		process.exit(1);
	}
};

connectDB().then(() => {
	createTestUser();
});
