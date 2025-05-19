import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrainerLogin.css';

// Combined trainer data from both yoga and fitness
const trainers = [
  // Yoga trainers
  {
    id: 1,
    name: "Sarah Johnson",
    type: "yoga",
    specialization: "Hatha Yoga",
  },
  {
    id: 2,
    name: "Raj Patel",
    type: "yoga",
    specialization: "Vinyasa Flow",
  },
  {
    id: 3,
    name: "Emma Chen",
    type: "yoga",
    specialization: "Yin Yoga",
  },
  {
    id: 4,
    name: "Miguel Santos",
    type: "yoga",
    specialization: "Ashtanga Yoga",
  },
  // Fitness trainers
  {
    id: 5,
    name: "John Smith",
    type: "fitness",
    specialization: "Strength Training",
  },
  {
    id: 6,
    name: "Lisa Anderson",
    type: "fitness",
    specialization: "HIIT",
  },
  {
    id: 7,
    name: "Mike Johnson",
    type: "fitness",
    specialization: "Cardio",
  }
];

const TrainerLogin: React.FC = () => {
  const [trainerName, setTrainerName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trainer = trainers.find(t =>
      t.name.toLowerCase() === trainerName.toLowerCase()
    );

    if (trainer) {
      // Store trainer info in localStorage
      localStorage.setItem('trainerInfo', JSON.stringify(trainer));

      // Redirect to appropriate dashboard
      if (trainer.type === 'yoga') {
        navigate('/yoga-trainer-dashboard');
      } else {
        navigate('/fitness-trainer-dashboard');
      }
    } else {
      setError('Trainer not found. Please check the name and try again.');
    }
  };

  return (
    <div className="trainer-login-container">
      <div className="trainer-login-card">
        <h2>Trainer Login</h2>
        <form onSubmit={handleSubmit} className="trainer-login-form">
          <div className="form-group">
            <label htmlFor="trainerName">Enter your name</label>
            <input
              type="text"
              id="trainerName"
              value={trainerName}
              onChange={(e) => {
                setTrainerName(e.target.value);
                setError('');
              }}
              placeholder="Enter your full name"
              className="trainer-input"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainerLogin;
