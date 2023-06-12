const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
} = require("../controllers/adminController");

const router = express.Router();

//GET || Users
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//GET || Doctors
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

//POST || Account Status
router.post("/changeAccountStatus", authMiddleware, changeAccountStatusController);

module.exports = router;
