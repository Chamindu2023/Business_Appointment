const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAppointment = async (req, res) => {
  
  try {
    const {clientName, startTime} = req.body;
    const businessId = req.user.businessId;

    if(!clientName || !startTime){
      return res.status(400).json({error: "Missing required fields"});
    }
    if (new Date(startTime) < new Date()) {
      return res.status(400).json({ error: "Cannot book an appointment in the past." });
    }
    const requestedTime = new Date(startTime);
    const windowStart = new Date(requestedTime.getTime() - 15 * 60000);
    const windowEnd = new Date(requestedTime.getTime() + 15 * 60000);

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        businessId: businessId,
        startTime: {
          gte: windowStart,
          lte: windowEnd
        },
        status: {
          not: "Cancelled"
        }
      }
    });
    if(existingAppointment){
      return res.status(409).json({error: "Requested slot is no longer available."});
    }
    const newAppointment = await prisma.appointment.create({
      data: {
        businessId,
        clientName,
        startTime: requestedTime,
        status: "Scheduled"
      }
    });res.status(201).json(newAppointment);
    } catch(error){
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Failed to create appointment." });
    }
  };
    
 

const getAllAppointments = async (req, res) => {
  try {
    // SECURED: Only fetch appointments belonging to the logged-in business
    const appointments = await prisma.appointment.findMany({
      where: { businessId: req.user.businessId }
    });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    // SECURED: Verify both ID and Business Ownership
    const appointment = await prisma.appointment.findFirst({
      where: { id: id, businessId: req.user.businessId }
    });
    
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientName, startTime, status } = req.body; // removed businessId from here

    // SECURED: updateMany allows us to filter by both ID and businessId safely
    const result = await prisma.appointment.updateMany({
      where: { id: id, businessId: req.user.businessId },
      data: { 
        clientName, 
        startTime: startTime ? new Date(startTime) : undefined, 
        status 
      }
    });

    if (result.count === 0) return res.status(404).json({ error: "Appointment not found or unauthorized" });
    res.status(200).json({ message: "Appointment updated successfully" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // SECURED
    const result = await prisma.appointment.deleteMany({
      where: { id: id, businessId: req.user.businessId }
    });

    if (result.count === 0) return res.status(404).json({ error: "Appointment not found or unauthorized" });
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // SECURED
    const result = await prisma.appointment.updateMany({
      where: { id: id, businessId: req.user.businessId },
      data: { status: "Cancelled" }
    });

    if (result.count === 0) return res.status(404).json({ error: "Appointment not found or unauthorized" });
    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const createPublicAppointment = async (req, res) => {
    try {
        const { businessId, clientName, startTime } = req.body;
        
        if (!businessId || !clientName || !startTime) {
            return res.status(400).json({ error: "All fields are required" });
        }
        if (new Date(startTime) < new Date()) {
            return res.status(400).json({ error: "Cannot book an appointment in the past." });
        }

        // Validate that the business exists
        const business = await prisma.business.findUnique({
            where: { id: businessId }
        });
        if (!business) {
            return res.status(404).json({ error: "Business not found. Invalid booking link." });
        }

        const requestedTime = new Date(startTime);
        const windowStart = new Date(requestedTime.getTime() - 15 * 60000);
        const windowEnd = new Date(requestedTime.getTime() + 15 * 60000);
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                businessId: businessId,
                startTime: {
                    gte: windowStart,
                    lte: windowEnd
                },
                status: {
                    not: "Cancelled"
                }
            }
        }); 
        if (existingAppointment) {
            return res.status(409).json({ error: "Requested slot is no longer available." });
        }
        const newAppointment = await prisma.appointment.create({
            data: {
                clientName,
                startTime: new Date(startTime),
                businessId: businessId,
                status: "Scheduled"
            }
        });
        res.status(201).json(newAppointment);
    } catch (error) {
        console.error("Error creating public appointment:", error);
        res.status(500).json({ error: "Failed to create Appointment." });
    }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  cancelAppointment,
  createPublicAppointment,
};