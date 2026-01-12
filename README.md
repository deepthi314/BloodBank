# Blood Bank Management System

A full‑stack Blood Bank Management System built with React, Node.js/Express, and MySQL.  
It supports public users (donors/recipients) and administrators to manage blood stock, donors, recipients, donations, and requests.

---

## Features

### Public
- View blood stock across blood banks
- Register as a donor
- Register as a recipient
- Simple contact/home pages

### Admin
- Secure admin sign‑in
- Admin dashboard
- Manage donors
  - Add, view, update, delete donors
  - View donor donation history
- Manage recipients
  - Add, view, update, delete recipients
  - View recipient request history
- Manage donations
  - Add donations with bank validation
  - List all donations
- Manage requests
  - Add requests with bank validation
  - Update request status
  - List all requests
- Manage admins
  - Add new admins
  - Update admin details
  - Delete admins

---

## Tech Stack

- **Frontend**
  - React (Create React App)
  - React Router
  - Bootstrap 5

- **Backend**
  - Node.js
  - Express
  - MySQL (via `mysql2`)
  - CORS

- **Database**
  - MySQL database `bloodbank`

---

## Project Structure

```text
BBMS/
├─ blood-bank-app/                 # React frontend
│  └─ blood-bank-app/
│     ├─ src/
│     │  ├─ App.js
│     │  ├─ index.js
│     │  └─ components/
│     │     ├─ homepage.js
│     │     ├─ signin.js
│     │     ├─ donor.js
│     │     ├─ recipient.js
│     │     ├─ bloodstock.js
│     │     ├─ admindashboard.js
│     │     ├─ bloodstockAdmin.js
│     │     ├─ manageDonor.js
│     │     ├─ manageRecipient.js
│     │     ├─ addDonations.js
│     │     ├─ addRequests.js
│     │     └─ addAdmin.js
│     └─ package.json
│
└─ blood-bank-app-backend/         # Node/Express backend
   └─ blood-bank-app-backend/
      ├─ server.js
      ├─ db.js
      └─ package.json
```

---

## Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node)
- MySQL server

---

## Backend Setup

1. **Go to backend folder**

   ```bash
   cd blood-bank-app-backend/blood-bank-app-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure database**

   Create a MySQL database (default name used is `bloodbank`):

   ```sql
   CREATE DATABASE bloodbank;
   ```

   Create the required tables (example structure – adjust to your schema):

   ```sql
   CREATE TABLE Blood_Bank (
     Bank_ID INT PRIMARY KEY AUTO_INCREMENT,
     Bank_Name VARCHAR(100),
     Location VARCHAR(255)
   );

   CREATE TABLE Admin_table (
     Admin_ID INT PRIMARY KEY AUTO_INCREMENT,
     Full_Name VARCHAR(100),
     Email VARCHAR(100),
     Contact_Number VARCHAR(20),
     Role_name VARCHAR(50),
     Username VARCHAR(50) UNIQUE,
     Pass_word VARCHAR(255),
     Bank_ID INT,
     FOREIGN KEY (Bank_ID) REFERENCES Blood_Bank(Bank_ID)
   );

   CREATE TABLE Donor (
     Donor_ID INT PRIMARY KEY AUTO_INCREMENT,
     Full_Name VARCHAR(100),
     Age INT,
     Gender VARCHAR(10),
     Blood_Group VARCHAR(5),
     Contact_Number VARCHAR(20),
     Email VARCHAR(100),
     Address VARCHAR(255),
     Last_Donation_Date DATE,
     Bank_ID INT,
     FOREIGN KEY (Bank_ID) REFERENCES Blood_Bank(Bank_ID)
   );

   CREATE TABLE Recipient (
     Recipient_ID INT PRIMARY KEY AUTO_INCREMENT,
     Full_Name VARCHAR(100),
     Age INT,
     Gender VARCHAR(10),
     Blood_Group VARCHAR(5),
     Contact_Number VARCHAR(20),
     Email VARCHAR(100),
     Address VARCHAR(255),
     Bank_ID INT,
     FOREIGN KEY (Bank_ID) REFERENCES Blood_Bank(Bank_ID)
   );

   CREATE TABLE Donation (
     Donation_ID INT PRIMARY KEY AUTO_INCREMENT,
     Donor_ID INT,
     Blood_Group VARCHAR(5),
     Donation_Date DATE,
     Units INT,
     Collected_By INT,
     Bank_ID INT,
     FOREIGN KEY (Donor_ID) REFERENCES Donor(Donor_ID),
     FOREIGN KEY (Collected_By) REFERENCES Admin_table(Admin_ID),
     FOREIGN KEY (Bank_ID) REFERENCES Blood_Bank(Bank_ID)
   );

   CREATE TABLE Request (
     Request_ID INT PRIMARY KEY AUTO_INCREMENT,
     Recipient_ID INT,
     Blood_Group VARCHAR(5),
     Request_Date DATE,
     Units INT,
     Request_Status VARCHAR(50),
     Fulfilled_By INT,
     Bank_ID INT,
     FOREIGN KEY (Recipient_ID) REFERENCES Recipient(Recipient_ID),
     FOREIGN KEY (Fulfilled_By) REFERENCES Admin_table(Admin_ID),
     FOREIGN KEY (Bank_ID) REFERENCES Blood_Bank(Bank_ID)
   );

   CREATE TABLE Blood_Stock (
     Bank_ID INT,
     Blood_Group VARCHAR(5),
     Units_Available INT,
     Last_Updated DATETIME,
     PRIMARY KEY (Bank_ID, Blood_Group),
     FOREIGN KEY (Bank_ID) REFERENCES Blood_Bank(Bank_ID)
   );
   ```

4. **Configure DB connection (optional via environment variables)**

   The backend reads from environment variables with fallbacks (see `db.js`):

   ```js
   host: process.env.DB_HOST || 'localhost',
   user: process.env.DB_USER || 'root',
   password: process.env.DB_PASSWORD || 'your_password',
   database: process.env.DB_NAME || 'bloodbank'
   ```

   You can create a `.env` file or set these in your shell before starting the server.

5. **Run backend**

   ```bash
   npm start
   ```

   Backend runs on:

   - `http://localhost:5000`

   Example endpoints:

   - `POST /signin`
   - `GET /bloodstock`
   - `GET /admin/dashboard`
   - `GET /admin/manage-donors`
   - `GET /admin/manage-recipients`
   - `POST /admin/add-donation`
   - `POST /admin/add-request`
   - `POST /admin/add-admin`
   - etc. (see `server.js` for full list)

---

## Frontend Setup

1. **Go to frontend folder**

   ```bash
   cd blood-bank-app/blood-bank-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run frontend**

   ```bash
   npm start
   ```

   Frontend runs on:

   - `http://localhost:3000`

   The app calls the backend directly using URLs like `http://localhost:5000/...`, so make sure the backend is running.

---

## Scripts

### Backend (`blood-bank-app-backend/blood-bank-app-backend`)

```bash
npm start    # Start Express server on port 5000
```

### Frontend (`blood-bank-app/blood-bank-app`)

```bash
npm start    # Start React dev server on port 3000
npm test     # Run tests (if any)
npm run build  # Production build
```

---

## Notes

- Make sure MySQL is running and the `bloodbank` database is created before signing in.
- Admin sign‑in expects credentials from the `Admin_table` (username and password fields).
- For deployment, you should:
  - Move DB credentials to environment variables
  - Use a production build of the React app
  - Serve the frontend from a static host and keep the Node/Express API on a server.
