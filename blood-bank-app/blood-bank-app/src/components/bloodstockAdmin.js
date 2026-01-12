import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import axios from "axios";
import AdminHeader from "./adminheader";

const Bloodstock = () => {
  const [bloodStockData, setBloodStockData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/bloodstock")
      .then((res) => {
        console.log(res.data)
        setBloodStockData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching blood stock data:", err);
      });
  }, []);

  return (
    <>
      <AdminHeader />

      <div className="container mt-5">
        <h2 className="mb-4 text-dark">Blood Stock Overview</h2>
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover">
            <thead className="table-danger">
              <tr>
                <th>Blood Group</th>
                <th>Units Available</th>
                <th>Last Updated</th>
                <th>Bank Name</th>
                <th>Location</th>
                <th>Bank ID</th>
              </tr>
            </thead>
            <tbody>
              {bloodStockData.map((stock, idx) => (
                <tr key={idx}>
                  <td>{stock.Blood_Group}</td>
                  <td>{stock.Units_Available}</td>
                  <td>{stock.Last_Updated}</td>
                  <td>{stock.Bank_Name}</td>
                  <td>{stock.Location}</td>
                  <td>{stock.Bank_ID}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Bloodstock;
