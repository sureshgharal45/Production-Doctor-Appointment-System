const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
} = require("../controllers/doctorController");

//router object
const router = express.Router();

//POST single doc info
router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

//POST UPDATE PROFILE
router.post("/updateProfile", authMiddleware, updateProfileController);

//POST GET SINGLE DOC INFO
router.post("/getDoctorById", authMiddleware, getDoctorByIdController);

//GET appointments
router.get(
  "/doctor-appointments",
  authMiddleware,
  doctorAppointmentsController
);

//POST update sttaus
router.post("/update-status", authMiddleware, updateStatusController);

module.exports = router;
