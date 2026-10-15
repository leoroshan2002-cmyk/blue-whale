import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const seedDefaultAdmin = async () => {
  const email = process.env.DEFAULT_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!email && !password) return;
  if (!email || !password) {
    throw new Error('DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must both be configured.');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.role !== 'admin') {
      throw new Error('DEFAULT_ADMIN_EMAIL belongs to a non-admin account; refusing to change its role.');
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name: 'Administrator',
    firstName: 'Administrator',
    email,
    password: hashedPassword,
    emailVerified: true,
    authProvider: 'local',
    role: 'admin',
  });

  console.log(`Default admin account created for ${email}`);
};

export default seedDefaultAdmin;
