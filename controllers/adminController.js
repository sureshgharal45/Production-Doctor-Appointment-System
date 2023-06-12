const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");

const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "Users data list",
      data: users,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while fetching users",
      err,
    });
  }
};

const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors data list",
      data: doctors,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while getting doctors data",
      err,
    });
  }
};

//doctor account status
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });
    const user = await userModel.findOne({ _id: doctor.userId });
    const notification = user.notification;
    notification.push({
      type: "doctor-request-account-updated",
      message: `Your doctor account request has been ${status}`,
      onClickPath: "/notification",
    });
    user.isDoctor = status === "approved" ? true : false;
    // doctor.status === "approved" &&
    //   (await userModel.findByIdAndUpdate(doctor.userId, { isDoctor: true }));
    await user.save();
    res.status(201).send({
      success: true,
      message: "Account status updated",
      data: doctor,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in account sttaus",
      err,
    });
  }
};

module.exports = {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
};
