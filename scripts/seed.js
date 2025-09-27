import bcrypt from 'bcryptjs';
import { initDb, User, Sport } from '../src/models/index.js';

await initDb();

const adminEmail = 'admin@example.com';
const passwordHash = await bcrypt.hash('admin123', 10);

await User.findOrCreate({
	where: { email: adminEmail },
	defaults: { name: 'Admin', email: adminEmail, passwordHash, role: 'admin' }
});

await Sport.findOrCreate({ where: { name: 'Football' }, defaults: { createdById: 1 } });
await Sport.findOrCreate({ where: { name: 'Basketball' }, defaults: { createdById: 1 } });

console.log('Seed completed. Admin login: admin@example.com / admin123');








