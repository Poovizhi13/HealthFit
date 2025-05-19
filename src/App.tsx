import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import HealthForm from './components/HealthForm';
import NutritionistDashboard from './components/NutritionistDashboard';
import UserDashboard from './components/UserDashboard'; 
import YogaTrainerDashboard from './components/YogaTrainerDashboard';
import FitnessTrainerDashboard from './components/FitnessTrainerDashboard';
import Suggestion from './components/Suggestion'; 
import Acknowledgement from './components/Acknowledgement';
import Yoga from './components/Yoga';
import Fitness from './components/Fitness';
import TrainerLogin from './components/TrainerLogin';
// Import placeholder components for new routes
// In a real app, you would create these components
const NutritionPlan = () => <div>Nutrition Plan Page</div>;
const NutritionPlanDetails = () => <div>Nutrition Plan Details Page</div>;
const FinalStep = () => <div>Final Step Page</div>;

// PrivateRoute component to protect authenticated routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/trainer-login" element={<TrainerLogin />} />

          {/* Protected Routes */}
          <Route
            path="/health-form"
            element={
              <PrivateRoute>
                <HealthForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/nutritionist-dashboard"
            element={
              <PrivateRoute>
                <NutritionistDashboard />
              </PrivateRoute>
            }
          />
          {/* User Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          {/* Suggestion Route */}
          <Route
            path="/suggestion"
            element={
              <PrivateRoute>
                <Suggestion />
              </PrivateRoute>
            }
          />
          <Route
            path="/yoga"
            element={
              <PrivateRoute>
                <Yoga />
              </PrivateRoute>
            }
          />
          <Route
            path="/fitness"
            element={
              <PrivateRoute>
                <Fitness />
              </PrivateRoute>
            }
          />
          {/* Acknowledgement Route - Now corrected */}
          <Route
            path="/acknowledgement"
            element={
              <PrivateRoute>
                <Acknowledgement />
              </PrivateRoute>
            }
          />
          <Route
            path="/yoga-trainer-dashboard"
            element={
              <PrivateRoute>
                <YogaTrainerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/fitness-trainer-dashboard"
            element={
              <PrivateRoute>
                <FitnessTrainerDashboard />
              </PrivateRoute>
            }
          />
          
          {/* New Routes for Nutrition Plan Flow */}
          <Route
            path="/nutrition-plan"
            element={
              <PrivateRoute>
                <NutritionPlan />
              </PrivateRoute>
            }
          />
          <Route
            path="/nutrition-plan-details"
            element={
              <PrivateRoute>
                <NutritionPlanDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/final-step"
            element={
              <PrivateRoute>
                <FinalStep />
              </PrivateRoute>
            }
          />

          {/* Redirect root to home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;