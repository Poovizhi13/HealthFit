import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { healthRecordService } from "../services/api.js";
import "./HealthForm.css";

const SubmitHealthRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
 
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    mobileNumber: "",
    height: "",
    weight: "",
    allergies: "",
    surgeries: "",
    medicalTreatment: "",
    bloodType: "",
    alcoholOrSmoke: "",
    dietarySupplements: "",
    purpose: "",
    healthCheckupDate: "",
  });
  const [currentMedicalReport, setCurrentMedicalReport] = useState(null);
  const [newMedicalReport, setNewMedicalReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
   
    const fetchRecord = async () => {
      try {
        if (id && import.meta.env.VITE_USE_API === 'true') {
          // Get data from API if editing an existing record
          const record = await healthRecordService.getRecordById(id);
         
          // Format date for input field (YYYY-MM-DD)
          const date = new Date(record.healthCheckupDate);
          const formattedDate = date.toISOString().split('T')[0];
         
          setFormData({
            ...record,
            healthCheckupDate: formattedDate
          });
         
          if (record.reportName) {
            setCurrentMedicalReport({
              name: record.reportName
            });
          }
        } else if (id) {
          // Get data from localStorage for demo mode
          const savedData = localStorage.getItem('healthRecords');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            const record = parsedData.find(r => r.id === id);
            
            if (record) {
              // Format date for input field
              const date = new Date(record.healthCheckupDate);
              const formattedDate = date.toISOString().split('T')[0];
              
              setFormData({
                ...record,
                healthCheckupDate: formattedDate
              });
              
              if (record.reportName) {
                setCurrentMedicalReport({
                  name: record.reportName
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching health record:", err);
        setError("Failed to load health record. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewMedicalReport(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Append file if new one is selected
      if (newMedicalReport) {
        formDataToSend.append('medicalReport', newMedicalReport);
      }

      if (import.meta.env.VITE_USE_API === 'true') {
        // Save to API
        if (id) {
          await healthRecordService.updateRecord(id, formDataToSend);
          setMessage("Health record updated successfully!");
        } else {
          await healthRecordService.createRecord(formDataToSend);
          setMessage("Health record submitted successfully!");
          
          // Clear the form after successful submission
          setFormData({
            fullName: "",
            age: "",
            gender: "",
            mobileNumber: "",
            height: "",
            weight: "",
            allergies: "",
            surgeries: "",
            medicalTreatment: "",
            bloodType: "",
            alcoholOrSmoke: "",
            dietarySupplements: "",
            purpose: "",
            healthCheckupDate: "",
          });
          setNewMedicalReport(null);
        }
      } else {
        // Save to localStorage for demo mode
        const currentDate = new Date().toISOString();
        
        const newRecord = {
          ...formData,
          id: id || `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          reportName: newMedicalReport ? newMedicalReport.name : currentMedicalReport?.name,
          nutritionistNotes: id ? formData.nutritionistNotes || "" : "",
          submittedDate: currentDate,
          fullName: String(formData.fullName),
          age: String(formData.age),
          gender: String(formData.gender),
          mobileNumber: String(formData.mobileNumber),
          height: String(formData.height),
          weight: String(formData.weight)
        };
        
        
        // Get existing records from localStorage
        let healthRecords = [];
const savedHealthRecords = localStorage.getItem('healthRecords');
if (savedHealthRecords) {
  const parsed = JSON.parse(savedHealthRecords);
  healthRecords = Array.isArray(parsed) ? parsed : [parsed]; // ✅ Always return an array
}

        
        // Update or add the record
        if (id) {
          // Update existing record
          healthRecords = healthRecords.map(record => 
            record.id === id ? newRecord : record
          );
          setMessage("Health record updated successfully!");
        } else {
          // Add new record
          healthRecords.push(newRecord);
          setMessage("Health record submitted successfully!");
          
          // Clear the form after successful submission
          setFormData({
            fullName: "",
            age: "",
            gender: "",
            mobileNumber: "",
            height: "",
            weight: "",
            allergies: "",
            surgeries: "",
            medicalTreatment: "",
            bloodType: "",
            alcoholOrSmoke: "",
            dietarySupplements: "",
            purpose: "",
            healthCheckupDate: "",
          });
          setNewMedicalReport(null);
        }
        
        // Save back to localStorage with consistent key
        localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
      }
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error("Error submitting health record:", err);
      setError("Failed to submit health record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="health-form-container">
      <h2>{id ? "Edit Health Record" : "Submit Health Record"}</h2>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="health-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number</label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="allergies">Allergies (if any)</label>
          <textarea
            id="allergies"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="surgeries">Previous Surgeries (if any)</label>
          <textarea
            id="surgeries"
            name="surgeries"
            value={formData.surgeries}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="medicalTreatment">Current Medical Treatment (if any)</label>
          <textarea
            id="medicalTreatment"
            name="medicalTreatment"
            value={formData.medicalTreatment}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bloodType">Blood Type</label>
            <select
              id="bloodType"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              required
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="alcoholOrSmoke">Do you consume alcohol or smoke?</label>
            <select
              id="alcoholOrSmoke"
              name="alcoholOrSmoke"
              value={formData.alcoholOrSmoke}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="No">No</option>
              <option value="Alcohol">Alcohol only</option>
              <option value="Smoke">Smoke only</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="dietarySupplements">Dietary Supplements (if any)</label>
          <textarea
            id="dietarySupplements"
            name="dietarySupplements"
            value={formData.dietarySupplements}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="purpose">Purpose of Consulting</label>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="healthCheckupDate">Date of Last Health Checkup</label>
          <input
            type="date"
            id="healthCheckupDate"
            name="healthCheckupDate"
            value={formData.healthCheckupDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="medicalReport">Medical Report (if any)</label>
          {currentMedicalReport && (
            <div className="current-file">
              Current file: {currentMedicalReport.name}
            </div>
          )}
          <input
            type="file"
            id="medicalReport"
            name="medicalReport"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <p className="file-hint">Accepted formats: PDF, JPG, JPEG, PNG</p>
        </div>
        
        {/* Show nutritionist notes if editing and they exist */}
        {id && formData.nutritionistNotes && (
          <div className="form-group nutritionist-notes">
            <label>Nutritionist Notes:</label>
            <div className="notes-content">{formData.nutritionistNotes}</div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={submitting}
          >
            {submitting 
              ? (id ? "Updating..." : "Submitting...") 
              : (id ? "Update Record" : "Submit Record")
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitHealthRecord;