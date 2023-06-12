const doctorModel = require("../models/doctorModel");
const apppointmentModel = require("../models/appointmentModel");
const appointmentModel = require("../models/appointmentModel");
const userModal = require("../models/userModel");

const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "doctor data fetch successfully",
      data: doctor,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: true,
      message: "Error in fetching doctors",
      err,
    });
  }
};

//update doc profile
const updateProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(201).send({
      success: true,
      message: "Doctor profile updated ",
      data: doctor,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Dcotor profile update issue",
      err,
    });
  }
};

//GET single doc
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Single doc info fetch",
      data: doctor,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in single doctor info",
      err,
    });
  }
};

//get appointments for doctor
const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    const appointments = await apppointmentModel.find({
      doctorId: doctor._id,
    });
    res.status(200).send({
      success: true,
      message: "Doctor appointments fetched successfully",
      data: appointments,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in doc appointments",
      err,
    });
  }
};

//update sttaus ctrl
const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointments = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status }
    );
    const user = await userModal.findOne({ _id: appointments.userId });
    const notification = user.notification;
    notification.push({
      type: "status-updated",
      message: `Your appointment has been ${status}`,
      onClickPath: "/doctor-appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment status updated",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in updating status",
      err,
    });
  }
};

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
};
