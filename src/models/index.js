import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sports-scheduler');
		console.log('MongoDB connected successfully');
	} catch (error) {
		console.error('MongoDB connection error:', error.message);
		console.log('Please make sure MongoDB is running on your system.');
		console.log('You can start MongoDB by running: mongod');
		console.log('Or install MongoDB Community Server if not installed.');
		throw error; // Re-throw to let the app handle it
	}
};

// User Schema
const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	passwordHash: { type: String, required: true },
	role: { type: String, enum: ['admin', 'player'], default: 'player' }
}, {
	timestamps: true
});

// Sport Schema
const sportSchema = new mongoose.Schema({
	name: { type: String, required: true },
	createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
	timestamps: true
});

// Session Schema
const sessionSchema = new mongoose.Schema({
	sportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
	createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	startsAt: { type: Date, required: true },
	venue: { type: String, required: true },
	lookingForCount: { type: Number, default: 0 },
	status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' },
	cancelReason: { type: String }
}, {
	timestamps: true
});

// SessionPlayer Schema (for many-to-many relationship)
const sessionPlayerSchema = new mongoose.Schema({
	sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	teamSlot: { type: String },
	status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
	requestedAt: { type: Date, default: Date.now },
	approvedAt: { type: Date },
	approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
	timestamps: true
});

// Create indexes for better performance
sportSchema.index({ createdById: 1 });
sessionSchema.index({ sportId: 1 });
sessionSchema.index({ createdById: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ startsAt: 1 });
sessionPlayerSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

// Create models
export const User = mongoose.model('User', userSchema);
export const Sport = mongoose.model('Sport', sportSchema);
export const Session = mongoose.model('Session', sessionSchema);
export const SessionPlayer = mongoose.model('SessionPlayer', sessionPlayerSchema);

export async function initDb() {
	await connectDB();
}



