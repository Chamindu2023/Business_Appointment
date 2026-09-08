const express = require("express");
const router = express.Router();
const{createAppointment,getAllAppointments,getAppointmentById,updateAppointment,deleteAppointment,cancelAppointment} = require("../controllers/AppoinmentController");
const authenticateToken = require("../middleware/auth.js");

router.use(authenticateToken);

router.post("/",createAppointment);
router.get("/",getAllAppointments);
router.get("/:id",getAppointmentById);
router.put("/:id",updateAppointment);
router.delete("/:id",deleteAppointment);
router.patch("/:id/cancel",cancelAppointment);

module.exports = router;