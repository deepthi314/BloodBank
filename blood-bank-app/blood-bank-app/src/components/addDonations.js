import React, { useState, useEffect } from 'react';
import AdminHeader from './adminheader';

const AddDonations = () => {
  const [formData, setFormData] = useState({
    donorId: '',
    bloodGroup: '',
    donationDate: '',
    unitsDonated: '',
    bankId: '',
    collectedBy: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [donorInfo, setDonorInfo] = useState(null);
  const [loadingDonorInfo, setLoadingDonorInfo] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [adminBankId, setAdminBankId] = useState('');
  const [donorBankMatch, setDonorBankMatch] = useState(null);

  // Fetch the currently logged-in admin's info on component mount
  useEffect(() => {
    const fetchCurrentAdmin = () => {
      const adminData = localStorage.getItem('adminData');
      if (adminData) {
        try {
          const parsedData = JSON.parse(adminData);
          if (parsedData.adminId) {
            setCurrentAdminId(parsedData.adminId);
            setAdminBankId(parsedData.bankId);
            
            // Auto-fill collectedBy field with admin ID
            // Auto-fill bankId with admin's bank ID
            setFormData(prev => ({
              ...prev,
              collectedBy: parsedData.adminId,
              bankId: parsedData.bankId || ''
            }));
          }
        } catch (error) {
          console.error('Error parsing admin data:', error);
        }
      }
    };

    fetchCurrentAdmin();
  }, []);

  // Function to fetch donor information when donor ID changes
  useEffect(() => {
    const fetchDonorInfo = async () => {
      if (!formData.donorId || formData.donorId.trim() === '') {
        setDonorInfo(null);
        setDonorBankMatch(null);
        return;
      }

      setLoadingDonorInfo(true);
      try {
        const response = await fetch('http://localhost:5000/admin/manage-donors');
        if (response.ok) {
          const allDonors = await response.json();
          const donor = allDonors.find(d => d.Donor_ID.toString() === formData.donorId.trim());
          
          if (donor) {
            setDonorInfo(donor);
            
            // Check if donor belongs to the same bank as admin
            const isSameBank = donor.Bank_ID == adminBankId;
            setDonorBankMatch(isSameBank);
            
            // Auto-fill blood group and bank ID
            setFormData(prev => ({
              ...prev,
              bloodGroup: donor.Blood_Group || '',
              bankId: adminBankId // Force admin's bank ID, not donor's bank ID
            }));
            
            // Show warning if banks don't match
            if (!isSameBank) {
              setErrorMessage(`⚠️ Warning: Donor belongs to Bank ID ${donor.Bank_ID}, but you are from Bank ID ${adminBankId}. You cannot add donations for donors from other banks.`);
            } else {
              setErrorMessage('');
            }
          } else {
            setDonorInfo(null);
            setDonorBankMatch(null);
            setErrorMessage('');
            // Clear auto-filled fields if donor not found
            setFormData(prev => ({
              ...prev,
              bloodGroup: '',
              bankId: adminBankId || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching donor info:', error);
        setDonorInfo(null);
        setDonorBankMatch(null);
      } finally {
        setLoadingDonorInfo(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchDonorInfo();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.donorId, adminBankId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear errors when user types
    if (errorMessage && name === 'donorId') {
      setErrorMessage('');
    }
    
    // If donor ID is being changed, we might need to clear auto-filled fields
    if (name === 'donorId' && !value.trim()) {
      setDonorInfo(null);
      setDonorBankMatch(null);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        bloodGroup: '',
        bankId: adminBankId || ''
      }));
    } else if (name === 'bankId') {
      // Prevent user from changing bank ID
      setFormData(prev => ({
        ...prev,
        bankId: adminBankId || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Basic validation
    if (!formData.donorId || !formData.bloodGroup || !formData.donationDate || 
        !formData.unitsDonated || !formData.bankId || !formData.collectedBy) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    // Validate donor exists
    if (!donorInfo) {
      setErrorMessage('Invalid Donor ID. Please enter a valid donor ID.');
      return;
    }

    // Validate donor belongs to same bank as admin
    if (!donorBankMatch) {
      setErrorMessage(`Cannot proceed: Donor belongs to Bank ID ${donorInfo.Bank_ID}, but you are from Bank ID ${adminBankId}. You can only add donations for donors in your own bank.`);
      return;
    }

    // Validate units donated
    const units = parseFloat(formData.unitsDonated);
    if (isNaN(units) || units <= 0) {
      setErrorMessage('Please enter a valid number of units (greater than 0)');
      return;
    }

    // Validate donation date
    const donationDate = new Date(formData.donationDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (donationDate > today) {
      setErrorMessage('Donation date cannot be in the future');
      return;
    }

    // Validate date is not too old (optional, e.g., not older than 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (donationDate < oneYearAgo) {
      setErrorMessage('Donation date seems too old (more than 1 year ago). Please verify.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/admin/add-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: formData.donorId,
          bloodGroup: formData.bloodGroup,
          donationDate: formData.donationDate,
          unitsDonated: formData.unitsDonated,
          bankId: formData.bankId,
          collectedBy: formData.collectedBy,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`✅ Donation added successfully! Donation ID: ${data.donationId}`);
        // Reset form but keep admin ID and bank ID
        setFormData({
          donorId: '',
          bloodGroup: '',
          donationDate: '',
          unitsDonated: '',
          bankId: adminBankId || '',
          collectedBy: currentAdminId,
        });
        setDonorInfo(null);
        setDonorBankMatch(null);
        setErrorMessage('');
      } else {
        setErrorMessage(data.error || 'Failed to add donation');
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      setErrorMessage('An error occurred while submitting the form.');
    }
  };

  // Get today's date for max date input
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get date one year ago for min date input
  const getOneYearAgoDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <AdminHeader />

      <section id="forms">
        <div className="container py-5">
          <h1>Add Donations</h1>
          <p className="mb-4">
            Admins can record blood donations here. Please enter all donation details accurately.
            <strong className="text-danger"> Note: You can only add donations for donors in your own bank.</strong>
          </p>

          {/* Admin Info Display */}
          {currentAdminId && (
            <div className="alert alert-info mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Logged in as:</strong> Admin ID {currentAdminId} | 
                  <strong> Bank ID:</strong> {adminBankId || 'Not assigned'}
                </div>
                <div>
                  <span className="badge bg-primary">Bank-Specific Access</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {errorMessage && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <span>{errorMessage}</span>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setErrorMessage('')}
                aria-label="Close"
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Donor ID with auto-fill info */}
            <div className="mb-3">
              <label htmlFor="donorId" className="form-label">
                Donor ID <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="donorId"
                name="donorId"
                placeholder="Enter donor's unique ID"
                required
                value={formData.donorId}
                onChange={handleChange}
                disabled={!adminBankId}
              />
              {!adminBankId && (
                <small className="text-danger">Cannot add donations: Your admin account is not assigned to a bank.</small>
              )}
              
              {loadingDonorInfo && (
                <small className="text-muted">Loading donor information...</small>
              )}
              
              {donorInfo && !loadingDonorInfo && (
                <div className={`mt-2 p-2 border rounded ${donorBankMatch ? 'bg-light' : 'bg-warning bg-opacity-25'}`}>
                  <small>
                    <strong>Donor Found:</strong> {donorInfo.Full_Name} | 
                    <strong> Blood Group:</strong> {donorInfo.Blood_Group} | 
                    <strong> Bank ID:</strong> {donorInfo.Bank_ID}
                    {donorBankMatch ? (
                      <span className="badge bg-success ms-2">✓ Same Bank</span>
                    ) : (
                      <span className="badge bg-danger ms-2">✗ Different Bank</span>
                    )}
                  </small>
                </div>
              )}
              
              {formData.donorId && !donorInfo && !loadingDonorInfo && (
                <small className="text-danger">Donor ID not found. Please check the ID.</small>
              )}
            </div>

            {/* Auto-filled Blood Group (editable) */}
            <div className="mb-3">
              <label htmlFor="bloodGroup" className="form-label">
                Blood Group <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="bloodGroup"
                name="bloodGroup"
                placeholder="e.g., A+, B-, O+"
                maxLength="5"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                disabled={!donorBankMatch}
              />
              <small className="form-text text-muted">
                Auto-filled from donor info. You can edit if needed.
              </small>
            </div>

            {/* Donation Date */}
            <div className="mb-3">
              <label htmlFor="donationDate" className="form-label">
                Donation Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="donationDate"
                name="donationDate"
                value={formData.donationDate}
                onChange={handleChange}
                max={getTodayDate()}
                min={getOneYearAgoDate()}
                required
                disabled={!donorBankMatch}
              />
              <small className="form-text text-muted">
                Select today's date or a past date (not older than 1 year)
              </small>
            </div>

            {/* Units Donated */}
            <div className="mb-3">
              <label htmlFor="unitsDonated" className="form-label">
                Units Donated <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="unitsDonated"
                name="unitsDonated"
                placeholder="Enter the units donated (e.g., 1, 2)"
                value={formData.unitsDonated}
                onChange={handleChange}
                min="0.5"
                step="0.5"
                required
                disabled={!donorBankMatch}
              />
              <small className="form-text text-muted">
                Typically 1 unit = 450ml of blood. Minimum 0.5 units.
              </small>
            </div>

            {/* Auto-filled Bank ID (read-only) */}
            <div className="mb-3">
              <label htmlFor="bankId" className="form-label">
                Bank ID <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control bg-light"
                id="bankId"
                name="bankId"
                value={formData.bankId}
                onChange={handleChange}
                readOnly
                required
              />
              <small className="form-text text-muted">
                Auto-filled with your bank ID. This field cannot be changed.
              </small>
            </div>

            {/* Auto-filled Admin ID (read-only) */}
            <div className="mb-3">
              <label htmlFor="collectedBy" className="form-label">
                Collected By (Admin ID) <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control bg-light"
                id="collectedBy"
                name="collectedBy"
                value={formData.collectedBy}
                onChange={handleChange}
                readOnly
                required
              />
              <small className="form-text text-muted">
                Auto-filled with your admin ID. This field cannot be changed.
              </small>
            </div>

            <button 
              type="submit" 
              className="btn btn-danger"
              disabled={!donorBankMatch || !adminBankId}
            >
              {(!donorBankMatch || !adminBankId) ? (
                <>
                  <i className="bi bi-lock-fill me-2"></i>
                  Submit (Disabled - Bank Validation Failed)
                </>
              ) : (
                'Submit Donation'
              )}
            </button>
          </form>

          {/* ✅ Success message */}
          {successMessage && (
            <div className="alert alert-success mt-4" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2"></i>
                <span>{successMessage}</span>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccessMessage('')}
                aria-label="Close"
              ></button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AddDonations;