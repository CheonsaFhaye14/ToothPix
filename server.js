require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.APP_API_PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Allow your frontend URL to make requests
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to MySQL Database');
});


// Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from "Bearer token"
  if (!token) return res.status(401).json({ message: 'Access Denied. No Token Provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
};



// User Registration Endpoint
app.post('/api/app/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('usertype').isIn(['patient', 'dentist']).withMessage('User type must be either "patient" or "dentist"')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, usertype } = req.body;
  const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';

  db.query(checkQuery, [username, email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error checking for existing user' });
    if (results.length > 0) return res.status(400).json({ message: 'Username or email already exists' });

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: 'Error hashing password' });

      const query = 'INSERT INTO users (username, email, password, usertype) VALUES (?, ?, ?, ?)';
      db.query(query, [username, email, hashedPassword, usertype], (err) => {
        if (err) return res.status(500).json({ message: 'Error registering user' });
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  });
});

// User Login Endpoint
app.post('/api/app/login', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';

  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error querying database' });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Error comparing passwords' });
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign(
        { userId: user.idUsers, username: user.username, usertype: user.usertype },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Login successful',
        token: token,
        idUsers: user.idUsers,
        usertype: user.usertype,
        user: { id: user.idUsers, username: user.username, email: user.email },
      });
    });
  });
});

app.put('/api/app/appointments/update-past', (req, res) => {
  const query = `
    UPDATE appointment
    SET status = 'D'
    WHERE date < CURDATE() AND status != 'D'
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error updating past appointments',
        error: err.message,
      });
    }

    res.status(200).json({
      message: 'Past appointments updated successfully',
      affectedRows: results.affectedRows,
    });
  });
});


app.post('/api/app/profile', authenticateToken, [
  body('firstname').optional().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastname').optional().isLength({ min: 1 }).withMessage('Last name is required'),
  body('birthdate').optional().isDate().withMessage('Invalid date format'),
  body('contact').optional().isLength({ min: 1 }).withMessage('Contact is required'),
  body('address').optional().isLength({ min: 1 }).withMessage('Address is required'),
  body('gender').optional().isLength({ min: 1 }).withMessage('Gender is required'),
  body('allergies').optional().isLength({ min: 1 }).withMessage('Allergies are required'),
  body('medicalhistory').optional().isLength({ min: 1 }).withMessage('Medical history is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('username').optional().isLength({ min: 1 }).withMessage('Username is required'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = req.user.userId;
  const { firstname, lastname, birthdate, contact, address, gender, username, email, allergies, medicalhistory } = req.body;

  // Prepare the update object, excluding password
  const updates = {};

  if (firstname) updates.firstname = firstname;
  if (lastname) updates.lastname = lastname;
  if (birthdate) updates.birthdate = birthdate;
  if (contact) updates.contact = contact;
  if (address) updates.address = address;
  if (gender) updates.gender = gender;
  if (username) updates.username = username;
  if (email) updates.email = email;
  if (allergies) updates.allergies = allergies;
  if (medicalhistory) updates.medicalhistory = medicalhistory;

  // Update the user profile without modifying the password
  const query = 'UPDATE users SET ? WHERE idUsers = ?';
  db.query(query, [updates, userId], (err) => {
    if (err) return res.status(500).json({ message: 'Error updating profile', error: err.message });
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});


app.get('/api/app/profile/:idUsers', authenticateToken, (req, res) => {
  const userId = req.params.idUsers;
  const query = 'SELECT * FROM users WHERE idUsers = ?'; // Query all fields for the user

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching profile', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ profile: results[0] }); // Send all fields
  });
});

app.put('/api/app/services/:id', [
  body('name').optional().isLength({ min: 3 }).withMessage('Service name must be at least 3 characters long'),
  body('price').optional().isDecimal().withMessage('Price must be a valid number'),
  body('description').optional().isLength({ min: 1 }).withMessage('Description must not be empty'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const serviceId = req.params.id;  // This is where the service ID comes in
  const { name, description, price } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (description) updates.description = description;
  if (price) updates.price = price;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No fields provided for update' });
  }

  const query = 'UPDATE service SET ? WHERE idservice = ?';
  db.query(query, [updates, serviceId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating service', error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json({ message: 'Service updated successfully' });
  });
});



// CRUD Operations for Services

// Add Service
app.post('/api/app/services', [
  body('name').isLength({ min: 3 }).withMessage('Service name must be at least 3 characters long'),
  body('price').isDecimal().withMessage('Price must be a valid number'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price } = req.body;
  const query = 'INSERT INTO service (name, description, price) VALUES (?, ?, ?)';

  db.query(query, [name, description, price], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding service', error: err.message });

    res.status(201).json({
      message: 'Service added successfully',
      service: { idservice: result.insertId, name, description, price },
    });
  });
});

// Get All Services
app.get('/api/app/services', (req, res) => {
  const query = 'SELECT * FROM service';

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching services', error: err.message });

    res.status(200).json({ message: 'Services fetched successfully', services: results });
  });
});

app.post('/api/app/appointments', (req, res) => {
  console.log("Received Appointment Data:", req.body);  // Log received data

  const { idpatient, iddentist, idservice, date, status, notes } = req.body;

  if (!idpatient || !iddentist || !idservice || !date || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO appointment (idpatient, iddentist, idservice, date, status, notes) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [idpatient, iddentist, idservice, date, status, notes || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Error creating appointment',
          error: err.message,
        });
      }

      res.status(201).json({
        message: 'Appointment created successfully',
        appointment: {
          idappointment: result.insertId,
          idpatient,
          iddentist,
          idservice,
          date,
          status,
          notes,
        },
      });
    }
  );
});



// Delete Service
app.delete('/api/app/services/:id', (req, res) => {
  const serviceId = req.params.id;
  const query = 'DELETE FROM service WHERE idservice = ?';

  db.query(query, [serviceId], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting service', error: err.message });

    res.status(200).json({ message: 'Service deleted successfully' });
  });
});

app.post('/api/app/appointments', authenticateToken, (req, res) => {
  const { idpatient, iddentist, idservice, date, status, notes } = req.body;

  if (!idpatient || !iddentist || !idservice || !date || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO appointment (idpatient, iddentist, idservice, date, status, notes) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(
    query,
    [idpatient, iddentist, idservice, date, status, notes || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Error creating appointment',
          error: err.message,
        });
      }

      res.status(201).json({
        message: 'Appointment created successfully',
        appointment: {
          idappointment: result.insertId,
          idpatient,
          iddentist,
          idservice,
          date,
          status,
          notes,
        },
      });
    }
  );
});

app.delete('/api/app/appointments/:id', (req, res) => { 
  const idappointment = req.params.id;

  if (!idappointment) {
    return res.status(400).json({ message: 'Appointment ID is required' });
  }

  const query = 'DELETE FROM appointment WHERE idappointment = ?';

  db.query(query, [idappointment], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error deleting appointment',
        error: err.message,
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment deleted successfully' });
  });
});
app.get('/api/app/patients', (req, res) => {
  const query = 'SELECT * FROM users WHERE usertype = "patient"';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching patients', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No patients found' });
    }

    res.status(200).json({ patients: results });
  });
});

app.get('/api/app/appointmentsrecord/:idpatient', (req, res) => {
  const idpatient = req.params.idpatient;

  const query = `
    SELECT 
      a.idappointment, a.notes, 
      s.price AS service_price
    FROM appointment a
    JOIN service s ON a.idservice = s.idservice
    WHERE a.idpatient = ? AND a.status = 'D'
  `;

  db.query(query, [idpatient], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching appointments', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'No completed appointments found' });

    // Make sure the response structure matches what the frontend expects
    res.status(200).json({
      appointments: results.map((appointment) => ({
        idappointment: appointment.idappointment,
        notes: appointment.notes,
        service_price: appointment.service_price, // Return service_price as expected
      }))
    });
  });
});

app.get('/api/app/summary', (req, res) => {
  const query = `
    SELECT 
      COUNT(CASE WHEN status = 'N' THEN 1 END) AS total_appointments,
      COUNT(CASE WHEN status = 'D' THEN 1 END) AS total_clinic_visits
    FROM appointment
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching summary', error: err.message });
    }

    res.status(200).json({
      total_appointments: results[0].total_appointments,
      total_clinic_visits: results[0].total_clinic_visits,
    });
  });
});


app.get('/api/app/dentists', (req, res) => {
  const query = 'SELECT idUsers, firstname, lastname FROM users WHERE usertype = "dentist"';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching dentists', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No dentists found' });
    }

    // Add a 'name' property to each dentist by combining firstname and lastname
    const dentistsWithNames = results.map(dentist => ({
      ...dentist,
      name: `${dentist.firstname} ${dentist.lastname}`, // Combine firstname and lastname
    }));

    res.status(200).json({ dentists: dentistsWithNames });
  });
});
app.get('/api/app/patients', (req, res) => {
  const query = 'SELECT idUsers, firstname, lastname FROM users WHERE usertype = "patient"';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching patients', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No patients found' });
    }

    // Add a 'name' property to each patient by combining firstname and lastname
    const patientsWithNames = results.map(patient => ({
      ...patient,
      name: `${patient.firstname} ${patient.lastname}`, // Combine firstname and lastname
    }));

    res.status(200).json({ patients: patientsWithNames });
  });
});


  // Get All Appointments Data
  app.get('/api/app/appointments', (req, res) => {
    const query = 'SELECT * FROM appointment';

    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ message: 'Error fetching appointments', error: err.message });
      if (results.length === 0) return res.status(404).json({ message: 'No appointments found' });

      // Return all appointment data
      res.status(200).json({ appointments: results });
    });
  });



// Start the Server
app.listen(PORT, () => {
  console.log(`App Server running on port ${PORT}`);
});
