const {PrismaClient} = require("@prisma/client")

const prisma = new PrismaClient();

const createAppointment = async (req, res) => {
  // 1. Only extract safe fields from the user's request body
  const { clientName, startTime } = req.body;

  try {
    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        startTime: new Date(startTime),
        // 2. FORCE the businessId from the verified token middleware
        businessId: req.user.businessId 
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error); // Helpful for debugging in the terminal
    res.status(400).json({ error: 'Failed to create appointment', details: error.message });
  }
};

const getAllAppointments = async (req,res)=>{
    try{
        const appointments = await prisma.appointment.findMany();
        res.status(200).json(appointments);
    }
    catch(error){
        console.error("Error fetching appointments:",error);
        res.status(500).json({error:"Internal server error"});
    }
}

const getAppointmentById = async (req,res)=>{
    try{
        const {id} = req.params;
        const appointment = await prisma.appointment.findUnique({where:{id}});
        res.status(200).json(appointment);
    }
    catch(error){
        console.error("Error fetching appointment:",error);
        res.status(500).json({error:"Internal server error"});
    }
}

const updateAppointment = async (req,res)=>{
    const {id} = req.params;
    const {clientName,startTime,status,businessId} = req.body;

    const appointment = await prisma.appointment.update({
        where:{id},
        data:{clientName,startTime,status,businessId}
    });
    res.status(200).json(appointment);
    try{
        const appointment = await prisma.appointment.update({
            where:{id},
            data:{clientName,startTime,status,businessId}
        });
        res.status(200).json({message:"Appointment updated successfully"});
    }
    catch(error){
        console.error("Error updating appointment:",error);
        res.status(500).json({error:"Internal server error"});
    }
}

const deleteAppointment = async (req,res)=>{
    try{
        const {id} = req.params;
        const appointment = await prisma.appointment.delete({where:{id}});
        res.status(200).json({message:"Appointment deleted successfully"});
    }
    catch(error){
        console.error("Error deleting appointment:",error);
        res.status(500).json({error:"Internal server error"});
    }
}

const cancelAppointment = async (req,res)=>{
    try{
        const {id} = req.params;
        const appointment = await prisma.appointment.update({
            where:{id},
            data:{status:"Cancelled"}
        });
        res.status(200).json({message:"Appointment cancelled successfully"});
    }
    catch(error){
        console.error("Error cancelling appointment:",error);
        res.status(500).json({error:"Internal server error"});
    }
}

module.exports = {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    cancelAppointment
}