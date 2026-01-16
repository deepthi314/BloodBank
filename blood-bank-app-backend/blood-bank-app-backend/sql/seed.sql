USE bloodbank;

INSERT INTO Blood_Bank (Bank_Name, Location) VALUES ('Central Bank', 'City Center');

INSERT INTO Admin_table (Full_Name, Email, Contact_Number, Role_name, Username, Pass_word, Bank_ID)
VALUES ('Admin User', 'admin@example.com', '9999999999', 'Admin', 'deepo', 'admin123', 1);

INSERT INTO Donor (Full_Name, Age, Gender, Blood_Group, Contact_Number, Email, Address, Last_Donation_Date, Bank_ID)
VALUES ('John Doe', 30, 'Male', 'O+', '9876543210', 'john@example.com', '123 Street', '2025-12-01', 1);

INSERT INTO Recipient (Full_Name, Age, Gender, Blood_Group, Contact_Number, Email, Address, Bank_ID)
VALUES ('Jane Smith', 28, 'Female', 'A+', '9876501234', 'jane@example.com', '456 Avenue', 1);

INSERT INTO Blood_Stock (Bank_ID, Blood_Group, Units_Available, Last_Updated)
VALUES (1, 'O+', 10, NOW()), (1, 'A+', 8, NOW()), (1, 'B+', 6, NOW()), (1, 'AB+', 4, NOW());
