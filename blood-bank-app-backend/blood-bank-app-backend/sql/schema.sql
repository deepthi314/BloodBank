CREATE DATABASE IF NOT EXISTS bloodbank;
USE bloodbank;

CREATE TABLE IF NOT EXISTS Blood_Bank (
  Bank_ID INT PRIMARY KEY AUTO_INCREMENT,
  Bank_Name VARCHAR(100),
  Location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Admin_table (
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

CREATE TABLE IF NOT EXISTS Donor (
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

CREATE TABLE IF NOT EXISTS Recipient (
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

CREATE TABLE IF NOT EXISTS Donation (
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

CREATE TABLE IF NOT EXISTS Request (
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

CREATE TABLE IF NOT EXISTS Blood_Stock (
  Bank_ID INT,
  Blood_Group VARCHAR(5),
  Units_Available INT,
  Last_Updated DATETIME,
  PRIMARY KEY (Bank_ID, Blood_Group),
  FOREIGN KEY (Bank_ID) REFERENCES Blood_Bank(Bank_ID)
);
