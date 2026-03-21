require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('JWT_SECRET loaded:', process.env.JWT_SECRET);

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in your .env file');
  process.exit(1);
}

const token = jwt.sign(
  {
    id:    '64a1b2c3d4e5f6a7b8c9d0e1',
    email: 'lashan@gmail.com',
    role:  'admin',
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('\n--- COPY THIS TOKEN ---\n');
console.log(token);
console.log('\n-----------------------\n');