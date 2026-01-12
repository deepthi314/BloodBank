import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Enable CORS to allow frontend (usually on different port) to connect
app.use(express.json()); // Parse JSON request bodies

// Public routes
app.get('/', (req, res) => {
  res.send('Welcome to Blood Bank API');
});

// Signin (POST example)

// Replace the current /signin endpoint (around line 24) with this:
app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM admin_table WHERE username = ? AND pass_word = ?';
  db.query({ sql: query, values: [username, password], timeout: 3000 }, (err, results) => {
    if (err) {
      console.error('Error in query:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length > 0) {
      const admin = results[0];
      // Login success - return all admin info
      res.json({ 
        message: 'Login successful',
        adminId: admin.admin_id,
        username: admin.Username,
        fullName: admin.Full_Name,
        role: admin.Role_name,
        bankId: admin.Bank_ID,
        email: admin.Email,
        contactNumber: admin.Contact_Number
      });
    } else {
      // Invalid credentials
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

// Donor routes
app.get('/donor', (req, res) => {
  // TODO: Return list of donors
  //res.json([{ id: 1, name: 'Donor 1' }]);
});
app.post('/donor', (req, res) => {
  const {
    fullName,
    age,
    gender,
    bloodGroup,
    contactNumber,
    email,
    address,
    lastDonationDate,
    bankId
  } = req.body;
  
  const query = `
    INSERT INTO donor(full_name, age, gender, blood_group, contact_number, email, address, last_donation_date, bank_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [fullName, age, gender, bloodGroup, contactNumber, email, address, lastDonationDate, bankId],
    (error, results) => {
      if (error) {
        console.error("Error inserting donor:", error);
        return res.status(500).json({ message: "Failed to register donor" });
      }

      // Return inserted donor ID
      res.status(201).json({
        message: "Donor registered successfully",
        donorId: results.insertId
      });
    }
  );
});


// Recipient routes
// Recipient routes
app.get('/recipient', (req, res) => {
  // TODO: Return list of recipients
});

app.post('/recipient', (req, res) => {
  const {
    fullName,
    age,
    gender,
    bloodGroup,
    contactNumber,
    email,
    address,
    bankId
  } = req.body;

  // Remove request_date from the query since it's not in the Recipient table anymore
  const query = `
    INSERT INTO recipient (full_name, age, gender, blood_group, contact_number, email, address, bank_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [fullName, age, gender, bloodGroup, contactNumber, email, address, bankId],
    (error, results) => {
      if (error) {
        console.error("Error inserting recipient:", error);
        return res.status(500).json({ message: "Failed to register recipient" });
      }

      res.status(201).json({
        message: "Recipient registered successfully",
        recipientId: results.insertId,
      });
    }
  );
});

// Blood stock routes
app.get('/bloodstock', (req, res) => {
  const query = `
    SELECT 
      Blood_Stock.Blood_Group,
      Blood_Stock.Units_Available,
      Blood_Stock.Last_Updated,
      Blood_Bank.Bank_Name,
      Blood_Bank.Bank_ID,
      Blood_Bank.Location
    FROM 
      Blood_Stock
    JOIN 
      Blood_Bank ON Blood_Stock.Bank_ID = Blood_Bank.Bank_ID
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching blood stock:', err);
      return res.status(500).json({ error: 'Failed to fetch blood stock' });
    }
    res.json(results);
  });
});

// Admin routes
app.get('/admin/dashboard', (req, res) => {
  // TODO: Return admin dashboard data
  res.json({ message: 'Admin dashboard data' });
});
app.get('/admin/bloodstock', (req, res) => {
  const query = `
    SELECT 
      Blood_Stock.Blood_Group,
      Blood_Stock.Units_Available,
      Blood_Stock.Last_Updated,
      Blood_Bank.Bank_Name
    FROM 
      Blood_Stock
    JOIN 
      Blood_Bank ON Blood_Stock.Bank_ID = Blood_Bank.Bank_ID
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching blood stock:', err);
      return res.status(500).json({ error: 'Failed to fetch blood stock' });
    }
    res.json(results);
  });
});
// Example route: GET /admin/donor-history/:donorId
app.get('/admin/donor-history/:donorId', (req, res) => {
  const donorId = req.params.donorId;
  const query = `
    SELECT 
      d.Full_Name,
      d.Age,
      d.Blood_Group,
      dn.Donation_Date
    FROM Donor d
    JOIN Donation dn ON d.Donor_ID = dn.Donor_ID
    WHERE d.Donor_ID = ?
    ORDER BY dn.Donation_Date DESC
  `;

  db.query(query, [donorId], (err, results) => {
    if (err) {
      console.error("Error fetching donor history:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});

// getting donation details with donation id
app.get('/admin/donation-details/:donationId', (req, res) => {
  const donationId = req.params.donationId;
  const query = `
    SELECT 
      d.Full_Name,
      d.Age,
      d.Blood_Group,
      dn.Donation_Date,
      dn.Units
    FROM Donation dn
    JOIN Donor d ON dn.Donor_ID = d.Donor_ID
    WHERE dn.Donation_ID = ?
  `;

  db.query(query, [donationId], (err, results) => {
    if (err) {
      console.error("Error fetching donation details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});
// GET all donors
app.get('/admin/manage-donors', (req, res) => {
  db.query('SELECT * FROM Donor', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});
app.get('/admin/donations', (req, res) => {
  const query = `
    SELECT 
      dn.Donation_ID,
      dn.Donor_ID,
      d.Full_Name,
      d.Blood_Group,
      dn.Donation_Date,
      dn.Units AS Blood_Units,
      dn.Bank_ID,
      dn.Collected_By
    FROM Donation dn
    JOIN Donor d ON dn.Donor_ID = d.Donor_ID
    ORDER BY dn.Donation_Date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching donations:", err);
      return res.status(500).json({ error: "Failed to fetch donations" });
    }
    res.json(results);
  });
});
// PUT update donor
app.put('/admin/update-donor/:donorId', (req, res) => {
  const { donorId } = req.params;
  const { Contact_Number, Email, Address, Bank_ID } = req.body;
  const query = `
    UPDATE Donor
    SET Contact_Number = ?, Email = ?, Address = ?, Bank_ID = ?
    WHERE Donor_ID = ?
  `;
  db.query(query, [Contact_Number, Email, Address, Bank_ID, donorId], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'Donor updated successfully' });
  });
});

// DELETE donor
app.delete('/admin/delete-donor/:donorId', (req, res) => {
  const { donorId } = req.params;
  db.query('DELETE FROM Donor WHERE Donor_ID = ?', [donorId], (err) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ message: 'Donor deleted successfully' });
  });
});

// GET recipient request history
app.get('/admin/recipient-history/:recipientId', (req, res) => {
  const recipientId = req.params.recipientId;

  const query = `
    SELECT 
      r.Full_Name,
      r.Age,
      r.Blood_Group,
      rq.Request_Date,
      rq.Blood_Group AS Requested_Blood_Group,
      rq.Units,
      rq.Request_Status
    FROM Recipient r
    JOIN Request rq ON r.Recipient_ID = rq.Recipient_ID
    WHERE r.Recipient_ID = ?
    ORDER BY rq.Request_Date DESC
  `;

  db.query(query, [recipientId], (err, results) => {
    if (err) {
      console.error("Error fetching recipient history:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});

// GET request details by Request_ID
app.get('/admin/request-details/:requestId', (req, res) => {
  const requestId = req.params.requestId;

  const query = `
    SELECT 
      r.Full_Name,
      r.Age,
      r.Blood_Group,
      rq.Request_Date,
      rq.Blood_Group AS Requested_Blood_Group,
      rq.Units,
      rq.Request_Status,
      rq.Fulfilled_By,
      rq.Bank_ID
    FROM Request rq
    JOIN Recipient r ON rq.Recipient_ID = r.Recipient_ID
    WHERE rq.Request_ID = ?
  `;

  db.query(query, [requestId], (err, results) => {
    if (err) {
      console.error("Error fetching request details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});

// GET all recipients
app.get('/admin/manage-recipients', (req, res) => {
  db.query('SELECT * FROM Recipient', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});
// GET all requests
app.get('/admin/requests', (req, res) => {
  const query = `
    SELECT 
      rq.Request_ID,
      r.Full_Name,
      rq.Blood_Group AS Requested_Blood_Group,
      rq.Request_Date,
      rq.Units,
      rq.Bank_ID,
      rq.Request_Status
    FROM Request rq
    JOIN Recipient r ON rq.Recipient_ID = r.Recipient_ID
    ORDER BY rq.Request_Date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching requests:", err);
      return res.status(500).json({ error: "Failed to fetch requests" });
    }
    res.json(results);
  });
});

// PUT update request status
app.put('/admin/update-request-status/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { Request_Status } = req.body;

  const query = `
    UPDATE Request
    SET Request_Status = ?
    WHERE Request_ID = ?
  `;

  db.query(query, [Request_Status, requestId], (err, result) => {
    if (err) {
      console.error("Error updating request status:", err);
      return res.status(500).json({ error: 'Update failed' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ message: 'Request status updated successfully' });
  });
});
// PUT update recipient
app.put('/admin/update-recipient/:recipientId', (req, res) => {
  const { recipientId } = req.params;
  const { Contact_Number, Email, Address, Bank_ID } = req.body;

  const query = `
    UPDATE Recipient
    SET Contact_Number = ?, Email = ?, Address = ?, Bank_ID = ?
    WHERE Recipient_ID = ?
  `;

  db.query(query, [Contact_Number, Email, Address, Bank_ID, recipientId], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'Recipient updated successfully' });
  });
});

// DELETE recipient
app.delete('/admin/delete-recipient/:recipientId', (req, res) => {
  const { recipientId } = req.params;

  db.query('DELETE FROM Recipient WHERE Recipient_ID = ?', [recipientId], (err) => {
    if (err) {
      console.error("SQL Delete Error:", err);  // ADD THIS LINE
      return res.status(500).json({ error: 'Delete failed' });
    }
    res.json({ message: 'Recipient deleted successfully' });
  });
});



app.get('/admin/manage-recipients', (req, res) => {
  // TODO: Return recipients for admin management
  res.json([{ id: 1, name: 'Recipient 1' }]);
});

// Add donation
// Add donation with bank validation
// Add donation with bank validation (REMOVED stock update)
app.post('/admin/add-donation', (req, res) => {
  const { donorId, bloodGroup, donationDate, unitsDonated, collectedBy, bankId } = req.body;

  // Basic validation
  if (!donorId || !bloodGroup || !donationDate || !unitsDonated || !collectedBy || !bankId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // First, check if the donor exists and get their bank ID
  const checkDonorQuery = 'SELECT Bank_ID FROM Donor WHERE Donor_ID = ?';
  
  db.query(checkDonorQuery, [donorId], (err, donorResults) => {
    if (err) {
      console.error('Error checking donor:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (donorResults.length === 0) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    
    const donorBankId = donorResults[0].Bank_ID;
    
    // Check if admin exists and get their bank ID
    const checkAdminQuery = 'SELECT Bank_ID FROM admin_table WHERE admin_id = ?';
    
    db.query(checkAdminQuery, [collectedBy], (err, adminResults) => {
      if (err) {
        console.error('Error checking admin:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (adminResults.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      
      const adminBankId = adminResults[0].Bank_ID;
      
      // Validate bank consistency
      // 1. Donor bank should match admin bank
      // 2. Donation bank should match admin bank
      if (donorBankId != adminBankId) {
        return res.status(400).json({ 
          error: 'Donor does not belong to your bank. You can only add donations for donors in your bank.' 
        });
      }
      
      if (bankId != adminBankId) {
        return res.status(400).json({ 
          error: 'You can only add donations to your own bank.' 
        });
      }
      
      // All validations passed, insert the donation
      const insertQuery = `
        INSERT INTO Donation (Donor_ID, Blood_Group, Donation_Date, Units, Collected_By, Bank_ID)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [donorId, bloodGroup, donationDate, unitsDonated, collectedBy, bankId],
        (err, result) => {
          if (err) {
            console.error('Database insertion error:', err);
            return res.status(500).json({ error: 'Failed to add donation' });
          }
          
          // REMOVED: Don't update blood stock here - let the SQL trigger handle it
          res.json({ 
            message: 'Donation added successfully', 
            donationId: result.insertId,
            donorBankId: donorBankId,
            adminBankId: adminBankId
          });
        }
      );
    });
  });
});


// Add request
// Add request with bank validation
app.post('/admin/add-request', (req, res) => {
  const { recipientId, bloodGroup, requestDate, unitsRequested, requestStatus, fulfilledBy, bankId } = req.body;

  if (!recipientId || !bloodGroup || !requestDate || !unitsRequested || !requestStatus || !fulfilledBy || !bankId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if the recipient exists and get their bank ID
  const checkRecipientQuery = 'SELECT Bank_ID FROM Recipient WHERE Recipient_ID = ?';
  
  db.query(checkRecipientQuery, [recipientId], (err, recipientResults) => {
    if (err) {
      console.error('Error checking recipient:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (recipientResults.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    
    const recipientBankId = recipientResults[0].Bank_ID;
    
    // Check if admin exists and get their bank ID
    const checkAdminQuery = 'SELECT Bank_ID FROM admin_table WHERE admin_id = ?';
    
    db.query(checkAdminQuery, [fulfilledBy], (err, adminResults) => {
      if (err) {
        console.error('Error checking admin:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (adminResults.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      
      const adminBankId = adminResults[0].Bank_ID;
      
      // Validate bank consistency
      if (recipientBankId != adminBankId) {
        return res.status(400).json({ 
          error: 'Recipient does not belong to your bank. You can only add requests for recipients in your bank.' 
        });
      }
      
      if (bankId != adminBankId) {
        return res.status(400).json({ 
          error: 'You can only add requests to your own bank.' 
        });
      }
      
      // All validations passed, insert the request
      const insertQuery = `INSERT INTO Request (Recipient_ID, Blood_Group, Request_Date, Units, Request_Status, Fulfilled_By, Bank_ID) VALUES (?, ?, ?, ?, ?, ?, ?)`;

      db.query(insertQuery, [recipientId, bloodGroup, requestDate, unitsRequested, requestStatus, fulfilledBy, bankId], (err, result) => {
        if (err) {
          console.error('DB insert error:', err);
          return res.status(500).json({ error: 'Failed to add request' });
        }
        res.json({ message: 'Request added successfully', requestId: result.insertId });
      });
    });
  });
});
// Add admin
app.post("/admin/add-admin", (req, res) => {
  const { fullName, email, contactNumber, roleName, username, password, bankId } = req.body;

  const sql = "INSERT INTO Admin_table (Full_Name, Email, Contact_Number, Role_name, Username, Pass_word, Bank_ID) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.query(sql, [fullName, email, contactNumber, roleName, username, password, bankId], (err, result) => {
    if (err) {
      console.error("Error inserting admin:", err);
      const message = err.code === 'ER_DUP_ENTRY' ? "Username already exists." : "Database error.";
      return res.status(err.code === 'ER_DUP_ENTRY' ? 400 : 500).json({ message });
    }

    res.status(201).json({ message: "Admin added successfully.", adminId: result.insertId });
  });
});

// GET all admins
app.get("/add-admin", (req, res) => {
  db.query("SELECT * FROM Admin_table", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// GET all admins
app.get("/admin/list", (req, res) => {
  const sql = `SELECT Admin_ID, Full_Name, Email, Contact_Number, Role_name, Username, Bank_ID FROM Admin_table`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching admins:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// UPDATE admin by ID (except Full_Name and Admin_ID)
app.patch("/admin/update-admin/:id", (req, res) => {
  const adminId = req.params.id;
  const { email, contactNumber, roleName, username, bankId } = req.body;

  const sql = `
    UPDATE Admin_table SET 
      Email = ?, Contact_Number = ?, Role_name = ?, Username = ?, Bank_ID = ?
    WHERE Admin_ID = ?
  `;

  db.query(sql, [email, contactNumber, roleName, username, bankId, adminId], (err, result) => {
    if (err) {
      console.error("Error updating admin:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Username already exists." });
      }
      return res.status(500).json({ message: "Database error." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }
    res.json({ message: "Admin updated successfully." });
  });
});

// DELETE admin by ID
app.delete("/admin/delete-admin/:id", (req, res) => {
  const adminId = req.params.id;

  const sql = `DELETE FROM Admin_table WHERE Admin_ID = ?`;

  db.query(sql, [adminId], (err, result) => {
    if (err) {
      console.error("Error deleting admin:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }
    res.json({ message: "Admin deleted successfully." });
  });
});


// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
