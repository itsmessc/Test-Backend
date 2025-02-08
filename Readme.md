
# Healthcare Appointment Booking API

This is the **backend API** for the Healthcare Appointment Booking App. It handles **user authentication, appointment booking, dentist management, and scheduling logic**.

---

## Features

- **User Authentication**: Manage users securely.
- **Appointment Management**: Book, cancel, and reschedule appointments.
- **Dentist Availability**: Tracks available time slots and prevents double booking.
- **Database Persistence**: Uses a JSON-based mock database (`db.json`).
- **Express.js API**: RESTful API built with **Node.js & Express.js**.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** (LTS recommended)
- **npm** (Comes with Node.js)
- **Postman** (Optional, for API testing)

---

## Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/itsmessc/Test-Backend.git
cd Test-Backend
```

### 2️⃣ Install Dependencies
```bash
npm install
```


## Running the Server

### **Start the Backend Server**
To start the backend API, run:
```bash
npm start
```

The API will be available at:
```
http://localhost:5000
```

---

## API Endpoints

### 🏥 **Dental Office & Services**
- `GET /dental-offices` → Fetch all dental offices
- `GET /services` → Get available services

### 🦷 **Dentists**
- `GET /dentists` → Fetch all dentists
- `GET /dentists/:id` → Get a specific dentist
- `GET /dentists/office/:officeId` → Get dentists by office

### 📅 **Appointments**
- `POST /appointments/book` → Book an appointment
- `GET /appointments/user/:userId` → Get all user appointments
- `PUT /appointments/reschedule/:id` → Reschedule an appointment
- `DELETE /appointments/cancel/:id` → Cancel an appointment

---

## Notes

- The **API_URL** should be configured in the frontend to match the backend server URL.
- For **Google Maps or location-based features**, the **GEOAPIFY_API_KEY** is required and configured in frontend.
- This backend uses a **JSON-based mock database (`db.json`)** for simplicity.

