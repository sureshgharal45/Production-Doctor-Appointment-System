const userModal = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");

//register callback
const registerController = async (req, res) => {
  try {
    const existingUser = await userModal.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User already exists",
      });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModal(req.body);
    await newUser.save();
    res.status(201).send({
      message: "Registration successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: `Register controller ${err.message}`,
    });
  }
};

//login controller
const loginController = async (req, res) => {
  try {
    const user = await userModal.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid email or password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login success", success: true, token });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: `Error in login ${err.message}`,
      success: false,
    });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModal.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({ success: true, data: user });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Auth error", success: false, err });
  }
};

//apply doctor ctrl
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body });
    await newDoctor.save();
    const adminUser = await userModal.findOne({ isAdmin: true });
    const notification = adminUser.notification;
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for doctor account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/doctors",
      },
    });
    await userModal.findByIdAndUpdate(adminUser._id, { notification });
    res.status(201).send({
      success: true,
      message: "Dcotor account applied successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error while applying for doctor",
    });
  }
};

//notication ctrl
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModal.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;
    seennotification.push(...notification);
    user.notification = [];
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notifications are marked as read",
      data: updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      err,
    });
  }
};

//delete all notification ctrl
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModal.findOne({ _id: req.body.userId });
    user.seennotification = [];
    const updateUser = await user.save();
    updateUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications deleted successfully",
      data: updateUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Unable to delete all notifications",
      err,
    });
  }
};

const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctors lists fetch successfully",
      data: doctors,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Unable to fetch the doctors",
      err,
    });
  }
};

//book appointment

const bookAppointmentController = async (req, res) => {
  try {
    // req.body.status = "pending";
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    const newAappointment = new appointmentModel(req.body);
    await newAappointment.save();
    const user = await userModal.findOne({ _id: req.body.doctorInfo.userId });
    user.notification.push({
      type: "New-appointment-request",
      message: `A new appointment request from ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Unable book appointment",
      err,
    });
  }
};

//Booking availabilty controller
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    // console.log("fromTime", fromTime);
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    // console.log("toTime", toTime);
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        success: false,
        message: "Appointments are not available at this time",
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in booking",
      err,
    });
  }
};

//user appointment cotrl
const userAppointmentsController = async (req, res) => {
  try {
    const userAppointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users appointments fetched successfully",
      data: userAppointments,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in user appointments",
      err,
    });
  }
};

const userProfileController = async (req, res) => {
  try {
    const user = await userModal.findOne({ _id: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Single user fetch successfully",
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in fetching single user",
      err,
    });
  }
};

const updateUserProfileController = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const singleUser = await userModal.findOneAndUpdate(
      { _id: req.body.userId },
      req.body
    );
    res.status(200).send({
      success: true,
      message: "User profile updated ",
      data: singleUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "User profile update issue",
      err,
    });
  }
};

module.exports = {
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
};
