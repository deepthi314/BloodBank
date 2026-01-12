import React, { useState, useEffect } from 'react';
import AdminHeader from './adminheader';

const AddRequests = () => {
  const [formData, setFormData] = useState({
    recipientId: '',
    bloodGroup: '',
    requestDate: '',
    unitsRequested: '',
    requestStatus: 'Pending', // Default to Pending
    fulfilledBy: '',
    bankId: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [loadingRecipientInfo, setLoadingRecipientInfo] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [adminBankId, setAdminBankId] = useState('');
  const [recipientBankMatch, setRecipientBankMatch] = useState(null);

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
            
            // Auto-fill fulfilledBy field with admin ID
            // Auto-fill bankId with admin's bank ID
            setFormData(prev => ({
              ...prev,
              fulfilledBy: parsedData.adminId,
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

  // Function to fetch recipient information when recipient ID changes
  useEffect(() => {
    const fetchRecipientInfo = async () => {
      if (!formData.recipientId || formData.recipientId.trim() === '') {
        setRecipientInfo(null);
        setRecipientBankMatch(null);
        return;
      }

      setLoadingRecipientInfo(true);
      try {
        const response = await fetch('http://localhost:5000/admin/manage-recipients');
        if (response.ok) {
          const allRecipients = await response.json();
          const recipient = allRecipients.find(r => r.Recipient_ID.toString() === formData.recipientId.trim());
          
          if (recipient) {
            setRecipientInfo(recipient);
            
            // Check if recipient belongs to the same bank as admin
            const isSameBank = recipient.Bank_ID == adminBankId;
            setRecipientBankMatch(isSameBank);
            
            // Auto-fill blood group if available
            setFormData(prev => ({
              ...prev,
              bloodGroup: recipient.Blood_Group || '',
              bankId: adminBankId // Force admin's bank ID
            }));
            
            // Show warning if banks don't match
            if (!isSameBank) {
              setErrorMessage(`⚠️ Warning: Recipient belongs to Bank ID ${recipient.Bank_ID}, but you are from Bank ID ${adminBankId}. You cannot add requests for recipients from other banks.`);
            } else {
              setErrorMessage('');
            }
          } else {
            setRecipientInfo(null);
            setRecipientBankMatch(null);
            setErrorMessage('');
            // Clear auto-filled fields if recipient not found
            setFormData(prev => ({
              ...prev,
              bloodGroup: '',
              bankId: adminBankId || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching recipient info:', error);
        setRecipientInfo(null);
        setRecipientBankMatch(null);
      } finally {
        setLoadingRecipientInfo(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchRecipientInfo();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.recipientId, adminBankId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear errors when user types
    if (errorMessage && name === 'recipientId') {
      setErrorMessage('');
    }
    
    // If recipient ID is being changed, clear auto-filled fields
    if (name === 'recipientId' && !value.trim()) {
      setRecipientInfo(null);
      setRecipientBankMatch(null);
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
    } else if (name === 'fulfilledBy') {
      // Prevent user from changing fulfilledBy (should be their admin ID)
      setFormData(prev => ({
        ...prev,
        fulfilledBy: currentAdminId
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
    if (!formData.recipientId || !formData.bloodGroup || !formData.requestDate || 
        !formData.unitsRequested || !formData.requestStatus || !formData.fulfilledBy || !formData.bankId) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    // Validate recipient exists
    if (!recipientInfo) {
      setErrorMessage('Invalid Recipient ID. Please enter a valid recipient ID.');
      return;
    }

    // Validate recipient belongs to same bank as admin
    if (!recipientBankMatch) {
      setErrorMessage(`Cannot proceed: Recipient belongs to Bank ID ${recipientInfo.Bank_ID}, but you are from Bank ID ${adminBankId}. You can only add requests for recipients in your own bank.`);
      return;
    }

    // Validate units requested
    const units = parseFloat(formData.unitsRequested);
    if (isNaN(units) || units <= 0) {
      setErrorMessage('Please enter a valid number of units (greater than 0)');
      return;
    }

    // Validate request date
    const requestDate = new Date(formData.requestDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (requestDate > today) {
      setErrorMessage('Request date cannot be in the future');
      return;
    }

    // Validate date is not too old (optional, e.g., not older than 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (requestDate < oneYearAgo) {
      setErrorMessage('Request date seems too old (more than 1 year ago). Please verify.');
      return;
    }

    // Validate request status - new requests should typically be Pending
    if (formData.requestStatus !== 'Pending') {
      const confirmed = window.confirm(`Are you sure you want to set the status to "${formData.requestStatus}" immediately? New requests are usually set to "Pending" first.`);
      if (!confirmed) {
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:5000/admin/add-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: formData.recipientId,
          bloodGroup: formData.bloodGroup,
          requestDate: formData.requestDate,
          unitsRequested: formData.unitsRequested,
          requestStatus: formData.requestStatus,
          fulfilledBy: formData.fulfilledBy,
          bankId: formData.bankId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`✅ Request added successfully! Request ID: ${data.requestId}`);
        // Reset form but keep admin ID and bank ID
        setFormData({
          recipientId: '',
          bloodGroup: '',
          requestDate: '',
          unitsRequested: '',
          requestStatus: 'Pending',
          fulfilledBy: currentAdminId,
          bankId: adminBankId || '',
        });
        setRecipientInfo(null);
        setRecipientBankMatch(null);
        setErrorMessage('');
      } else {
        setErrorMessage(data.error || 'Failed to add request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
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
          <h1>Add Blood Requests</h1>
          <p className="mb-4">
            Admins can record blood requests here. Please enter all request details accurately.
            <strong className="text-danger"> Note: You can only add requests for recipients in your own bank.</strong>
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
            {/* Recipient ID with auto-fill info */}
            <div className="mb-3">
              <label htmlFor="recipientId" className="form-label">
                Recipient ID <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                id="recipientId"
                name="recipientId"
                className="form-control"
                placeholder="Enter recipient's unique ID"
                value={formData.recipientId}
                onChange={handleChange}
                required
                disabled={!adminBankId}
              />
              {!adminBankId && (
                <small className="text-danger">Cannot add requests: Your admin account is not assigned to a bank.</small>
              )}
              
              {loadingRecipientInfo && (
                <small className="text-muted">Loading recipient information...</small>
              )}
              
              {recipientInfo && !loadingRecipientInfo && (
                <div className={`mt-2 p-2 border rounded ${recipientBankMatch ? 'bg-light' : 'bg-warning bg-opacity-25'}`}>
                  <small>
                    <strong>Recipient Found:</strong> {recipientInfo.Full_Name} | 
                    <strong> Blood Group:</strong> {recipientInfo.Blood_Group} | 
                    <strong> Bank ID:</strong> {recipientInfo.Bank_ID}
                    {recipientBankMatch ? (
                      <span className="badge bg-success ms-2">✓ Same Bank</span>
                    ) : (
                      <span className="badge bg-danger ms-2">✗ Different Bank</span>
                    )}
                  </small>
                </div>
              )}
              
              {formData.recipientId && !recipientInfo && !loadingRecipientInfo && (
                <small className="text-danger">Recipient ID not found. Please check the ID.</small>
              )}
            </div>

            {/* Auto-filled Blood Group (editable) */}
            <div className="mb-3">
              <label htmlFor="bloodGroup" className="form-label">
                Blood Group Required <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="bloodGroup"
                name="bloodGroup"
                className="form-control"
                placeholder="e.g., A+, B-, O+"
                maxLength={5}
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                disabled={!recipientBankMatch}
              />
              <small className="form-text text-muted">
                Auto-filled from recipient info. You can edit if needed.
              </small>
            </div>

            {/* Request Date */}
            <div className="mb-3">
              <label htmlFor="requestDate" className="form-label">
                Request Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                id="requestDate"
                name="requestDate"
                className="form-control"
                value={formData.requestDate}
                onChange={handleChange}
                max={getTodayDate()}
                min={getOneYearAgoDate()}
                required
                disabled={!recipientBankMatch}
              />
              <small className="form-text text-muted">
                Select today's date or a past date (not older than 1 year)
              </small>
            </div>

            {/* Units Requested */}
            <div className="mb-3">
              <label htmlFor="unitsRequested" className="form-label">
                Units Requested <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                id="unitsRequested"
                name="unitsRequested"
                className="form-control"
                placeholder="Enter units requested (e.g., 1, 2)"
                value={formData.unitsRequested}
                onChange={handleChange}
                min="0.5"
                step="0.5"
                required
                disabled={!recipientBankMatch}
              />
              <small className="form-text text-muted">
                Minimum 0.5 units. Typically 1 unit = 450ml of blood.
              </small>
            </div>

            {/* Request Status */}
            <div className="mb-3">
              <label htmlFor="requestStatus" className="form-label">
                Request Status <span className="text-danger">*</span>
              </label>
              <select
                id="requestStatus"
                name="requestStatus"
                className="form-select"
                value={formData.requestStatus}
                onChange={handleChange}
                required
                disabled={!recipientBankMatch}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
              <small className="form-text text-muted">
                New requests are usually "Pending". Set to "Completed" only if fulfilled immediately.
              </small>
            </div>

            {/* Auto-filled Admin ID (read-only) */}
            <div className="mb-3">
              <label htmlFor="fulfilledBy" className="form-label">
                Fulfilled By (Admin ID) <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="fulfilledBy"
                name="fulfilledBy"
                className="form-control bg-light"
                value={formData.fulfilledBy}
                onChange={handleChange}
                readOnly
                required
              />
              <small className="form-text text-muted">
                Auto-filled with your admin ID. This field cannot be changed.
              </small>
            </div>

            {/* Auto-filled Bank ID (read-only) */}
            <div className="mb-3">
              <label htmlFor="bankId" className="form-label">
                Bank ID <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                id="bankId"
                name="bankId"
                className="form-control bg-light"
                value={formData.bankId}
                onChange={handleChange}
                readOnly
                required
              />
              <small className="form-text text-muted">
                Auto-filled with your bank ID. This field cannot be changed.
              </small>
            </div>

            <button 
              type="submit" 
              className="btn btn-danger"
              disabled={!recipientBankMatch || !adminBankId}
            >
              {(!recipientBankMatch || !adminBankId) ? (
                <>
                  <i className="bi bi-lock-fill me-2"></i>
                  Submit (Disabled - Bank Validation Failed)
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </form>

          {/* Success message */}
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

export default AddRequests;