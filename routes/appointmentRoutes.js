const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Path to db.json
const DB_FILE = path.join(__dirname, "../db.json");

// Function to read from db.json
const readDatabase = () => {
  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data);
};

// Function to write to db.json
const writeDatabase = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
};

// Initialize data
let mockData = readDatabase();
let appointments = mockData.appointments || [];
let dentists = mockData.dentists || []; // Assuming dentists are stored in db.json

router.get("/", (req, res) => {
  res.json(appointments);
});

router.get("/user/:userId", (req, res) => {
  console.log("GET /appointments/user/:userId", req.params.userId);
  const userAppointments = appointments.filter(app => app.userId == req.params.userId);
  if (userAppointments.length === 0) {
    return res.status(404).json({ error: "No appointments found for this user" });
  }
  res.json(userAppointments);
});

router.post("/book", (req, res) => {
  const {
    officeId,
    officeName,
    serviceId,
    serviceName,
    servicePrice,
    dentistId,
    dentistName,
    date,
    time,
    paymentStatus,
    userId,
    location
  } = req.body;
  console.log("POST /appointments/book", req.body);

  // Validate input data
  if (!officeId || !officeName || !serviceId || !serviceName || !servicePrice || !dentistId || !dentistName || !date || !time || !paymentStatus) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check if dentist exists
  const dentist = dentists.find(d => d.id === dentistId);
  if (!dentist) {
    return res.status(404).json({ error: "Dentist not found" });
  }

  // Check if the selected time slot is available
  const isSlotUnavailable = dentist.unavailableSlots.some(slot =>
    slot.date === date && slot.times.includes(time)
  );
  if (isSlotUnavailable) {
    return res.status(400).json({ error: "Time slot unavailable" });
  }

  // Create new appointment object based on provided data
  const newAppointment = {
    id: appointments.length + 1,
    officeId,
    officeName,
    serviceId,
    serviceName,
    servicePrice,
    dentistId,
    dentistName,
    date,
    time,
    status: "Confirmed", // Set the status of the appointment to "Confirmed"
    paymentStatus, // Use provided payment status (e.g., "Paid")
    location,
    userId
  };

  // Add new appointment to appointments array
  appointments.push(newAppointment);

  // Update dentist's unavailableSlots with the new appointment's time slot
  const unavailableSlotIndex = dentist.unavailableSlots.findIndex(slot => slot.date === date);
  if (unavailableSlotIndex === -1) {
    // If no slot exists for the date, create a new entry
    dentist.unavailableSlots.push({ date, times: [time] });
  } else {
    // If slot exists for the date, add the time to the existing array
    dentist.unavailableSlots[unavailableSlotIndex].times.push(time);
  }

  // Save the updated dentist's data back into the mock database
  mockData.dentists = dentists;

  // Save changes to db.json
  mockData.appointments = appointments;
  writeDatabase(mockData);

  res.json({ message: "Appointment booked successfully", appointment: newAppointment });
});


router.delete("/cancel/:id", (req, res) => {
  console.log("DELETE /appointments/cancel/:id", req.params.id);

  // Find the appointment
  const appointment = appointments.find(app => app.id == req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  // Find the dentist
  const dentist = dentists.find(d => d.id === appointment.dentistId);
  if (dentist && dentist.unavailableSlots) {
    // Find the booked slot for the appointment
    console.log(appointment.date, appointment.time);
    const slotIndex = dentist.unavailableSlots.findIndex(slot => slot.date === appointment.date);

    if (slotIndex !== -1) {
      console.log("Before removal:", JSON.stringify(dentist.unavailableSlots, null, 2));

      // Remove the specific time from unavailable slots
      dentist.unavailableSlots[slotIndex].times = dentist.unavailableSlots[slotIndex].times.filter(
        time => time !== appointment.time
      );

      // If no times left on that date, remove the entire date entry
      if (dentist.unavailableSlots[slotIndex].times.length === 0) {
        dentist.unavailableSlots.splice(slotIndex, 1);
      }

      console.log("After removal:", JSON.stringify(dentist.unavailableSlots, null, 2));
    }
  }

  // Change the appointment status instead of removing it
  appointment.status = "Cancelled";

  // Save changes to db.json
  mockData.appointments = appointments;
  mockData.dentists = dentists;
  writeDatabase(mockData);

  res.json({ message: "Appointment cancelled successfully", appointment });
});


router.put("/reschedule/:id", (req, res) => {
  const { newDate, newTime } = req.body;

  const appointment = appointments.find(app => app.id == req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  // Find the dentist
  const dentist = mockData.dentists.find(d => d.id === appointment.dentistId);
  if (!dentist) {
    return res.status(404).json({ error: "Dentist not found" });
  }

  const oldSlotIndex = dentist.unavailableSlots.findIndex(slot => slot.date === appointment.date);
  if (oldSlotIndex !== -1) {
    dentist.unavailableSlots[oldSlotIndex].times = dentist.unavailableSlots[oldSlotIndex].times.filter(
      time => time !== appointment.time
    );

    // If no more times are booked on that date, remove the entire date entry
    if (dentist.unavailableSlots[oldSlotIndex].times.length === 0) {
      dentist.unavailableSlots.splice(oldSlotIndex, 1);
    }
  }

  const isSlotUnavailable = dentist.unavailableSlots.some(slot =>
    slot.date === newDate && slot.times.includes(newTime)
  );
  if (isSlotUnavailable) {
    return res.status(400).json({ error: "New time slot unavailable" });
  }
  const newSlotIndex = dentist.unavailableSlots.findIndex(slot => slot.date === newDate);
  if (newSlotIndex === -1) {
    dentist.unavailableSlots.push({ date: newDate, times: [newTime] });
  } else {
    dentist.unavailableSlots[newSlotIndex].times.push(newTime);
  }

  appointment.date = newDate;
  appointment.time = newTime;

  mockData.appointments = appointments;
  mockData.dentists = dentists;
  writeDatabase(mockData);

  res.json({ message: "Appointment rescheduled successfully", appointment });
});

module.exports = router;
