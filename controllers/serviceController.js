const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createService = async (req, res) => {
  try {
    const { name, description, duration, price } = req.body;
    const businessId = req.user.businessId;

    if (!name || !duration || price === undefined) {
      return res.status(400).json({ error: "Missing required fields: name, duration, price" });
    }

    const newService = await prisma.service.create({
      data: {
        name,
        description,
        duration,
        price,
        businessId,
      },
    });

    res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
};

const getServices = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const services = await prisma.service.findMany({
      where: {
        businessId,
      },
    });

    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

module.exports = {
  createService,
  getServices,
};
