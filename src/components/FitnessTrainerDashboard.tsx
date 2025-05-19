import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrainerDashboard.css';

interface Booking {
  id: string;
  studentName: string;
  studentDetails: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    medicalConditions: string;
    allergies: string;
    purpose: string;
  };
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  program?: string;
  goals?: string;
}

interface TrainerInfo {
  id: number;
  name: string;
  type: string;
  specialization: string;
}

const FitnessTrainerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [trainerInfo, setTrainerInfo] = useState<TrainerInfo | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    // Get trainer info from localStorage
    const storedTrainerInfo = localStorage.getItem('trainerInfo');
    if (!storedTrainerInfo) {
      navigate('/trainer-login');
      return;
    }

    const trainer = JSON.parse(storedTrainerInfo);
    if (trainer.type !== 'fitness') {
      navigate('/trainer-login');
      return;
    }

    setTrainerInfo(trainer);

    // Load bookings from localStorage (in a real app, this would be from an API)
    const storedBookings = localStorage.getItem(`bookings_${trainer.id}`);
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('trainerInfo');
    navigate('/trainer-login');
  };

  const filteredBookings = bookings.filter(booking => booking.status === activeTab);

  const updateBookingStatus = (bookingId: string, newStatus: 'upcoming' | 'completed' | 'cancelled') => {
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    );
    setBookings(updatedBookings);
    
    // Save to localStorage
    if (trainerInfo) {
      localStorage.setItem(`bookings_${trainerInfo.id}`, JSON.stringify(updatedBookings));
    }
  };

  if (!trainerInfo) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="trainer-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {trainerInfo.name}</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        <p className="trainer-info">
          {trainerInfo.specialization} Trainer
        </p>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Today's Sessions</h3>
            <p className="stat-number">
              {bookings.filter(b => 
                b.status === 'upcoming' && 
                new Date(b.date).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Completed Sessions</h3>
            <p className="stat-number">
              {bookings.filter(b => b.status === 'completed').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Upcoming Sessions</h3>
            <p className="stat-number">
              {bookings.filter(b => b.status === 'upcoming').length}
            </p>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Sessions
          </button>
          <button
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
          <button
            className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <p className="no-bookings">No {activeTab} sessions found.</p>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-info">
                  <div className="booking-header">
                    <h3>{booking.studentName}</h3>
                    <div className="booking-time">
                      <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
                      <p>Time: {booking.time}</p>
                    </div>
                  </div>
                  
                  {booking.studentDetails && (
                    <div className="student-details">
                      <h4>Student Details:</h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="label">Age:</span>
                          <span>{booking.studentDetails.age}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Gender:</span>
                          <span>{booking.studentDetails.gender}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Height:</span>
                          <span>{booking.studentDetails.height} cm</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Weight:</span>
                          <span>{booking.studentDetails.weight} kg</span>
                        </div>
                      </div>
                      <div className="medical-info">
                        <div className="detail-item">
                          <span className="label">Medical Conditions:</span>
                          <span>{booking.studentDetails.medicalConditions}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Allergies:</span>
                          <span>{booking.studentDetails.allergies}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Purpose:</span>
                          <span>{booking.studentDetails.purpose}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="booking-actions">
                  {booking.status === 'upcoming' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="action-button complete"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="action-button cancel"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Session Details</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedBooking(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Student:</strong> {selectedBooking.studentName}
              </div>
              <div className="detail-row">
                <strong>Date:</strong> {new Date(selectedBooking.date).toLocaleDateString()}
              </div>
              <div className="detail-row">
                <strong>Time:</strong> {selectedBooking.time}
              </div>
              <div className="detail-row">
                <strong>Program:</strong> {selectedBooking.program}
              </div>
              <div className="detail-row">
                <strong>Goals:</strong>
                <p>{selectedBooking.goals}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessTrainerDashboard; 