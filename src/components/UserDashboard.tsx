import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { healthRecordService } from "../services/api.js";
import "./UserDashboard.css";

interface HealthFormData {
  id?: string;
  fullName: string;
  age: string;
  gender: string;
  mobileNumber: string;
  height: string;
  weight: string;
  allergies: string;
  surgeries: string;
  medicalTreatment: string;
  bloodType: string;
  alcoholOrSmoke: string;
  dietarySupplements: string;
  purpose: string;
  healthCheckupDate: string;
  createdAt?: string;
  updatedAt?: string;
  medicalReportName?: string;
  reportName?: string | null;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState<HealthFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchHealthData = async () => {
      try {
        if (import.meta.env.VITE_USE_API === "true") {
          const records = await healthRecordService.getAllRecords();
          if (records && records.length > 0) {
            const latestRecord = records.sort((a: any, b: any) =>
              new Date(b.updatedAt || b.createdAt).getTime() -
              new Date(a.updatedAt || a.createdAt).getTime()
            )[0];
            setHealthData(latestRecord);
            calculateBMI(latestRecord);
          }
        } else {
          const savedData = localStorage.getItem("healthSubmittedData");
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            setHealthData(parsedData);
            calculateBMI(parsedData);
          }
        }
      } catch (err) {
        console.error("Error fetching health data:", err);
        setError("Failed to load health data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [navigate]);

  const calculateBMI = (data: HealthFormData) => {
    if (data.height && data.weight) {
      const heightInMeters = Number(data.height) / 100;
      const weightInKg = Number(data.weight);
      const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
      setBmi(parseFloat(calculatedBmi.toFixed(2)));

      if (calculatedBmi < 18.5) {
        setBmiCategory("Underweight");
      } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
        setBmiCategory("Normal weight");
      } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
        setBmiCategory("Overweight");
      } else {
        setBmiCategory("Obese");
      }
    }
  };

  const handleEditInfo = () => {
    if (healthData && healthData.id) {
      navigate(`/edit-health-record/${healthData.id}`);
    } else {
      navigate("/submit-health-record");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // if any user info is stored
    navigate("/login");
  };

  const handleViewMedicalReport = async () => {
    if (healthData && healthData.id && import.meta.env.VITE_USE_API === "true") {
      try {
        await healthRecordService.downloadMedicalReport(healthData.id);
      } catch (err) {
        console.error("Error downloading medical report:", err);
        setError("Failed to download medical report. Please try again later.");
      }
    } else {
      alert("Medical report download is only available in API mode");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      if (dateString.includes("T")) {
        return new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  if (loading) {
    return <div className="loading">Loading health data...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="no-data-container">
        <h2>No Health Data Found</h2>
        <p>You haven't submitted any health information yet.</p>
        <button onClick={() => navigate("/submit-health-record")}>
          Submit Health Information
        </button>
      </div>
    );
  }

  const reportName = healthData.medicalReportName || healthData.reportName;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Health Dashboard</h1>
        <div className="header-buttons">
          <button onClick={handleEditInfo} className="edit-button">
            Edit Information
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>BMI Score</h3>
          <div className="card-value">{bmi || "N/A"}</div>
          <div className="card-detail">{bmiCategory}</div>
        </div>

        <div className="card">
          <h3>Last Updated</h3>
          <div className="card-value">
            {healthData.updatedAt
              ? formatDate(healthData.updatedAt)
              : healthData.createdAt
              ? formatDate(healthData.createdAt)
              : "Not submitted"}
          </div>
        </div>
      </div>

      <div className="health-details">
        <h2>Personal Details</h2>
        <div className="details-grid">
          <div className="detail-item">
            <span className="label">Full Name:</span>
            <span className="value">{healthData.fullName}</span>
          </div>
          <div className="detail-item">
            <span className="label">Age:</span>
            <span className="value">{healthData.age}</span>
          </div>
          <div className="detail-item">
            <span className="label">Gender:</span>
            <span className="value">{healthData.gender}</span>
          </div>
          <div className="detail-item">
            <span className="label">Mobile Number:</span>
            <span className="value">{healthData.mobileNumber || "Not provided"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Height:</span>
            <span className="value">{healthData.height ? `${healthData.height} cm` : "Not provided"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Weight:</span>
            <span className="value">{healthData.weight ? `${healthData.weight} kg` : "Not provided"}</span>
          </div>
        </div>

        <h2>Medical Information</h2>
        <div className="details-grid">
          <div className="detail-item">
            <span className="label">Blood Type:</span>
            <span className="value">{healthData.bloodType || "Not provided"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Allergies:</span>
            <span className="value">{healthData.allergies || "None reported"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Past Surgeries:</span>
            <span className="value">{healthData.surgeries || "None reported"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Current Medical Treatment:</span>
            <span className="value">{healthData.medicalTreatment || "None reported"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Alcohol/Smoking:</span>
            <span className="value">{healthData.alcoholOrSmoke || "Not provided"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Dietary Supplements:</span>
            <span className="value">{healthData.dietarySupplements || "None reported"}</span>
          </div>
        </div>

        <h2>Health Checkup</h2>
        <div className="details-grid">
          <div className="detail-item">
            <span className="label">Purpose:</span>
            <span className="value">{healthData.purpose || "Not provided"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Health Checkup Date:</span>
            <span className="value">
              {healthData.healthCheckupDate ? formatDate(healthData.healthCheckupDate) : "Not provided"}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">Medical Report:</span>
            <span className="value">
              {reportName ? (
                <div className="report-container">
                  <span>{reportName}</span>
                  {import.meta.env.VITE_USE_API === "true" && (
                    <button className="download-button" onClick={handleViewMedicalReport}>
                      Download
                    </button>
                  )}
                </div>
              ) : (
                "No report uploaded"
              )}
            </span>
          </div>
        </div>

        {/* Suggestion Button */}
        <div>
          <span className="suggestion">Click here to know your suggestion</span>
          <button className="suggestion-button" onClick={() => navigate('/suggestion')}>
            Suggestion
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
