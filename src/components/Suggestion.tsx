import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Suggestion.css';

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
  nutritionistNotes?: string;
  notesHistory?: Array<{
    id: string;
    content: string;
    timestamp: string;
    createdBy: string;
  }>;
}

interface SuggestionCategory {
  category: string;
  recommendations: string[];
  description: string;
}

const Suggestion: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [healthData, setHealthData] = useState<HealthFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchHealthRecord = () => {
      try {
        const allRecordsJSON = localStorage.getItem("allHealthRecords");
        let record: HealthFormData | undefined;

        if (allRecordsJSON) {
          const records: HealthFormData[] = JSON.parse(allRecordsJSON);
          record = id
            ? records.find(r => r.id === id)
            : records.sort((a, b) => {
                const dateA = (a.updatedAt || a.createdAt || '').toString();
                const dateB = (b.updatedAt || b.createdAt || '').toString();
                return new Date(dateB).getTime() - new Date(dateA).getTime();
              })[0];
        } else {
          const singleRecordJSON = localStorage.getItem("healthSubmittedData");
          if (singleRecordJSON) {
            record = JSON.parse(singleRecordJSON);
          }
        }

        if (record) {
          setHealthData(record);
          calculateBMI(record);
          generateSuggestions(record);
        } else {
          setError("Health record not found");
        }
      } catch (err) {
        console.error("Error fetching health record:", err);
        setError("Failed to load health data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthRecord();
  }, [id, navigate]);

  const calculateBMI = (data: HealthFormData) => {
    if (data.height && data.weight) {
      const heightInMeters = Number(data.height) / 100;
      const weightInKg = Number(data.weight);
      const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
      setBmi(parseFloat(calculatedBmi.toFixed(2)));

      if (calculatedBmi < 18.5) {
        setBmiCategory("Underweight");
      } else if (calculatedBmi < 25) {
        setBmiCategory("Normal weight");
      } else if (calculatedBmi < 30) {
        setBmiCategory("Overweight");
      } else {
        setBmiCategory("Obese");
      }
    }
  };

  const generateSuggestions = (data: HealthFormData) => {
    const suggestionsList: SuggestionCategory[] = [];

    if (bmi) {
      if (bmi < 18.5) {
        suggestionsList.push({
          category: "Underweight Diet Plan",
          description: "Focus on nutrient-dense foods to support healthy weight gain.",
          recommendations: [
            "Eat high-calorie snacks like nuts and cheese.",
            "Consume whole milk and dairy products.",
            "Eat more meals per day with larger portions.",
            "Include protein-rich foods like meat and legumes.",
            "Add healthy oils to meals (olive oil, coconut oil)."
          ]
        });
      } else if (bmi >= 25) {
        suggestionsList.push({
          category: "Weight Management Diet Plan",
          description: "Focus on balanced nutrition and portion control.",
          recommendations: [
            "Limit processed and sugary foods.",
            "Increase intake of vegetables and fiber.",
            "Control portion sizes.",
            "Stay physically active regularly.",
            "Choose lean proteins and whole grains."
          ]
        });
      } else {
        suggestionsList.push({
          category: "Balanced Diet Plan",
          description: "Maintain a healthy weight with a balanced diet.",
          recommendations: [
            "Eat a variety of fruits and vegetables.",
            "Maintain regular meal times.",
            "Stay hydrated and avoid sugary drinks.",
            "Practice mindful eating.",
            "Limit red meat and increase plant-based options."
          ]
        });
      }
    }

    const age = parseInt(data.age, 10);
    if (!isNaN(age)) {
      if (age >= 50) {
        suggestionsList.push({
          category: "Nutrition for 50+",
          description: "Age-specific nutritional recommendations.",
          recommendations: [
            "Increase calcium and vitamin D intake.",
            "Focus on fiber and heart-healthy fats.",
            "Stay hydrated and physically active.",
            "Eat antioxidant-rich fruits and vegetables."
          ]
        });
      }
    }

    // Add nutritionist notes history if available
    if (data.notesHistory && data.notesHistory.length > 0) {
      const sortedNotes = [...data.notesHistory].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      suggestionsList.push({
        category: "Nutritionist Notes History",
        description: "Detailed notes and recommendations from your nutritionist",
        recommendations: sortedNotes.map(note => 
          `[${new Date(note.timestamp).toLocaleDateString()}] ${note.content}`
        )
      });
    } else if (data.nutritionistNotes && data.nutritionistNotes.trim()) {
      // Fallback for old format
      suggestionsList.push({
        category: "Nutritionist's Notes",
        description: "Based on nutritionist's input.",
        recommendations: data.nutritionistNotes.split('\n').filter(line => line.trim())
      });
    }

    setSuggestions(suggestionsList);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleProceed = () => {
    navigate('/acknowledgement');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!healthData) return <div className="error">No health data found</div>;

  return (
    <div className="suggestion-container" ref={printRef}>
      <div className="suggestion-header">
        <h2>Health Analysis & Suggestions</h2>
        <div className="patient-info">
          <p><strong>Name:</strong> {healthData.fullName}</p>
          <p><strong>Age:</strong> {healthData.age}</p>
          <p><strong>Gender:</strong> {healthData.gender}</p>
          <p><strong>Date:</strong> {formatDate(healthData.healthCheckupDate)}</p>
        </div>
      </div>

      {bmi !== null && (
        <p><strong>BMI:</strong> {bmi} ({bmiCategory})</p>
      )}

      <div ref={printRef}>
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-category">
            <h3>{suggestion.category}</h3>
            <p>{suggestion.description}</p>
            <ul>
              {suggestion.recommendations.map((rec, recIndex) => (
                <li key={recIndex}>{rec}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="suggestion-footer">
        <p><strong>Last updated:</strong> {formatDate(healthData.updatedAt || healthData.createdAt || '')}</p>
        <button onClick={handlePrint} className="print-button">Print Suggestions</button>
        <button onClick={handleProceed} className="proceed-button">Proceed Further</button>
      </div>
    </div>
  );
};

export default Suggestion;
