const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAppointment = async (req, res) => {
  const { clientName, startTime } = req.body;
  try {
    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        startTime: new Date(startTime),
        businessId: req.user.businessId // Securely assigned
      }
    });
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create appointment', details: error.message });
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

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  cancelAppointment
};