const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const registerBusiness = async (req, res) => {
  const { businessName, ownerEmail, ownerName, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create business and the first admin user simultaneously
    const business = await prisma.business.create({
      data: {
        name: businessName,
        ownerEmail,
        users: {
          create: {
            name: ownerName,
            email: ownerEmail,
            password: hashedPassword,
            role: 'admin'
          }
        }
      }
    });

    res.status(201).json({ message: 'Business registered', businessId: business.id });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed', details: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    // Embed the crucial businessId inside the token payload
    const token = jwt.sign(
      { userId: user.id, businessId: user.businessId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { registerBusiness, login };