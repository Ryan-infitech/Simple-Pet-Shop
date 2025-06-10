// Basic controller structure - can be expanded later
const { executeQuery } = require("../config/database");

const getServices = async (req, res) => {
  // Controller logic here
  res.json({ message: "Services controller - to be implemented" });
};

const getOrders = async (req, res) => {
  // Controller logic here
  res.json({ message: "Orders controller - to be implemented" });
};

const getAppointments = async (req, res) => {
  // Controller logic here
  res.json({ message: "Appointments controller - to be implemented" });
};

module.exports = {
  getServices,
  getOrders,
  getAppointments,
};
