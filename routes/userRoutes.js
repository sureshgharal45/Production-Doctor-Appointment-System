const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
  userProfileController,
  updateUserProfileController,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

//router object
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//Apply Doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

//notifications doctor || POST
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);

//notifications doctor || POST
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

//GET all doctors
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

// POST Book appointment
router.post("/book-appointment", authMiddleware, bookAppointmentController);

// POST Booking availability
router.post(
  "/booking-availability",
  authMiddleware,
  bookingAvailabilityController
);

//appointment lists
router.get("/user-appointments", authMiddleware, userAppointmentsController);

//get single user
router.post("/user-profile", authMiddleware, userProfileController);

//update single user
router.post(
  "/update-user-profile",
  authMiddleware,
  updateUserProfileController
);

module.exports = router;
