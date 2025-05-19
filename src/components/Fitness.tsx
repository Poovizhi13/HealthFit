import React, { useState, useEffect } from 'react';
import { Users, Award, Calendar, Clock } from 'lucide-react';
import './fitness-page.css';
import { useNavigate } from 'react-router-dom';

interface Trainer {
  id: number;
  name: string;
  specialization: string;
  experience: string;
  certifications: string[];
  imageUrl: string;
  slots: {
    day: string;
    times: string[];
  }[];
}

interface Booking {
  id: string;
  trainerId: number;
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
}

const fitnessTrainers: Trainer[] = [
  {
    id: 1,
    name: "Alex Rivera",
    specialization: "Strength Training",
    experience: "7 years",
    certifications: ["NASM CPT", "NSCA CSCS"],
    imageUrl: "/api/placeholder/200/200",
    slots: [
      { day: "Monday", times: ["7:00 AM", "12:00 PM", "6:00 PM"] },
      { day: "Wednesday", times: ["8:00 AM", "1:00 PM", "5:00 PM"] },
      { day: "Friday", times: ["6:00 AM", "11:00 AM", "4:00 PM"] }
    ]
  },
  {
    id: 2,
    name: "Jessica Wu",
    specialization: "HIIT & Cardio",
    experience: "5 years",
    certifications: ["ACE CPT", "AFAA Group Fitness"],
    imageUrl: "/api/placeholder/200/200",
    slots: [
      { day: "Tuesday", times: ["6:30 AM", "9:00 AM", "5:30 PM"] },
      { day: "Thursday", times: ["7:30 AM", "12:30 PM", "6:30 PM"] },
      { day: "Saturday", times: ["8:00 AM", "10:00 AM", "12:00 PM"] }
    ]
  },
  {
    id: 3,
    name: "Marcus Johnson",
    specialization: "Functional Training",
    experience: "9 years",
    certifications: ["NSCA CPT", "FMS Level 2"],
    imageUrl: "/api/placeholder/200/200",
    slots: [
      { day: "Monday", times: ["9:00 AM", "2:00 PM", "7:00 PM"] },
      { day: "Thursday", times: ["8:00 AM", "1:00 PM", "6:00 PM"] },
      { day: "Sunday", times: ["9:00 AM", "11:00 AM", "1:00 PM"] }
    ]
  },
  {
    id: 4,
    name: "Zara Ahmed",
    specialization: "Weightlifting",
    experience: "6 years",
    certifications: ["USAW Level 1", "CrossFit L2"],
    imageUrl: "/api/placeholder/200/200",
    slots: [
      { day: "Tuesday", times: ["5:00 AM", "10:00 AM", "4:00 PM"] },
      { day: "Wednesday", times: ["6:00 AM", "12:00 PM", "5:00 PM"] },
      { day: "Friday", times: ["7:00 AM", "1:00 PM", "6:00 PM"] }
    ]
  },
  {
    id: 5,
    name: "David Kim",
    specialization: "Sports Conditioning",
    experience: "8 years",
    certifications: ["NSCA CSCS", "TRX Certified"],
    imageUrl: "/api/placeholder/200/200",
    slots: [
      { day: "Monday", times: ["10:00 AM", "3:00 PM", "7:30 PM"] },
      { day: "Thursday", times: ["9:00 AM", "2:00 PM", "6:30 PM"] },
      { day: "Saturday", times: ["7:00 AM", "11:00 AM", "3:00 PM"] }
    ]
  },
  {
    id: 6,
    name: "Sophia Martinez",
    specialization: "Bodybuilding",
    experience: "10 years",
    certifications: ["ISSA CFT", "NASM PES"],
    imageUrl: "/api/placeholder/200/200",
    slots: [
      { day: "Tuesday", times: ["8:00 AM", "1:00 PM", "6:00 PM"] },
      { day: "Friday", times: ["9:00 AM", "2:00 PM", "5:00 PM"] },
      { day: "Sunday", times: ["10:00 AM", "12:00 PM", "2:00 PM"] }
    ]
  }
];

const FitnessPage: React.FC = () => {
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load existing bookings from localStorage
    const storedBookings = localStorage.getItem('fitnessBookings');
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }

    // Load health data from localStorage
    const healthRecords = localStorage.getItem('healthRecords');
    if (healthRecords) {
      const records = JSON.parse(healthRecords);
      // Get the latest health record
      const latestRecord = Array.isArray(records) 
        ? records[records.length - 1] 
        : records;
      setHealthData(latestRecord);
    }
  }, []);

  // Get unique specializations for the filter
  const specializations = [...new Set(fitnessTrainers.map(trainer => trainer.specialization))];

  const handleTrainerClick = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setSelectedSlot(null);
  };

  const closeTrainerDetails = () => {
    setSelectedTrainer(null);
    setSelectedSlot(null);
  };

  const handleTrainerLogin = () => {
    navigate('/trainer-login');
  };

  const isSlotBooked = (trainerId: number, day: string, time: string) => {
    return bookings.some(booking => 
      booking.trainerId === trainerId && 
      booking.date === day && 
      booking.time === time &&
      booking.status === 'upcoming'
    );
  };

  const handleTimeSlotClick = (day: string, time: string) => {
    setSelectedSlot({ day, time });
  };

  const handleBookSession = () => {
    if (!healthData) {
      alert('Please complete your health form before booking a session.');
      navigate('/submit-health-record');
      return;
    }

    if (selectedTrainer && selectedSlot) {
      // Create a new booking with health data
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        trainerId: selectedTrainer.id,
        studentName: healthData.fullName,
        studentDetails: {
          age: healthData.age,
          gender: healthData.gender,
          height: healthData.height,
          weight: healthData.weight,
          medicalConditions: healthData.medicalTreatment || 'None',
          allergies: healthData.allergies || 'None',
          purpose: healthData.purpose
        },
        date: selectedSlot.day,
        time: selectedSlot.time,
        status: 'upcoming'
      };

      // Update bookings in state and localStorage
      const updatedBookings = [...bookings, newBooking];
      setBookings(updatedBookings);
      localStorage.setItem('fitnessBookings', JSON.stringify(updatedBookings));

      // Store in trainer's bookings
      const trainerBookings = localStorage.getItem(`bookings_${selectedTrainer.id}`) || '[]';
      const parsedTrainerBookings = JSON.parse(trainerBookings);
      localStorage.setItem(
        `bookings_${selectedTrainer.id}`, 
        JSON.stringify([...parsedTrainerBookings, newBooking])
      );

      // Show confirmation
      alert('Session booked successfully!');

      // Close the modal
      closeTrainerDetails();
    }
  };

  const filteredTrainers = selectedSpecialty 
    ? fitnessTrainers.filter(trainer => trainer.specialization === selectedSpecialty)
    : fitnessTrainers;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-blue-800 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Fitness Training</h1>
          <p className="mt-2 text-lg max-w-2xl mx-auto">
            Expert personal trainers to help you achieve your fitness goals
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">Filter by specialty:</h2>
          <button
            onClick={handleTrainerLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Trainer Login
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <button 
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedSpecialty === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedSpecialty(null)}
          >
            All
          </button>
          
          {specializations.map((specialty) => (
            <button 
              key={specialty}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedSpecialty === specialty 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedSpecialty(specialty)}
            >
              {specialty}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <Users className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{fitnessTrainers.length}</h3>
              <p className="text-gray-600">Professional Trainers</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <Award className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">15+</h3>
              <p className="text-gray-600">Training Specialties</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <Calendar className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">7</h3>
              <p className="text-gray-600">Days a Week</p>
            </div>
          </div>
        </div>

        {/* Trainers Listing */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Available Fitness Trainers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrainers.map((trainer) => (
              <div 
                key={trainer.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <img 
                    src={trainer.imageUrl} 
                    alt={`${trainer.name} - Fitness Trainer`} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-blue-600 text-white py-1 px-3 rounded-bl-lg">
                    {trainer.specialization}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{trainer.name}</h3>
                  <p className="text-gray-600">{trainer.experience} experience</p>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Certifications:</h4>
                    <div className="flex flex-wrap gap-2">
                      {trainer.certifications.map((cert, index) => (
                        <span 
                          key={index} 
                          className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-gray-700">
                    <h4 className="font-medium mb-2">Available Days:</h4>
                    <div className="flex flex-wrap gap-2">
                      {trainer.slots.map((slot, index) => (
                        <span 
                          key={index}
                          className="bg-blue-50 text-blue-700 px-2 py-1 text-sm rounded"
                        >
                          {slot.day}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors"
                    onClick={() => handleTrainerClick(trainer)}
                  >
                    View Full Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Trainer Details Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center border-b p-6">
              <h2 className="text-2xl font-bold text-gray-800">{selectedTrainer.name}</h2>
              <button 
                onClick={closeTrainerDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <img 
                    src={selectedTrainer.imageUrl} 
                    alt={selectedTrainer.name} 
                    className="w-full h-auto rounded-lg"
                  />
                  
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Specializations</h3>
                    <p className="text-blue-600 font-medium">{selectedTrainer.specialization}</p>
                    
                    <h3 className="font-semibold text-lg mt-4 mb-2">Experience</h3>
                    <p>{selectedTrainer.experience}</p>
                    
                    <h3 className="font-semibold text-lg mt-4 mb-2">Certifications</h3>
                    <ul className="list-disc list-inside">
                      {selectedTrainer.certifications.map((cert, index) => (
                        <li key={index}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold mb-4">About {selectedTrainer.name}</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedTrainer.name} is a certified personal trainer specializing in {selectedTrainer.specialization.toLowerCase()} 
                    with {selectedTrainer.experience} of professional experience. They are passionate about helping clients achieve their 
                    fitness goals through personalized training programs and expert guidance.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Available Sessions</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {selectedTrainer.slots.map((slot, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-blue-600 text-white py-2 px-4 font-medium">
                          {slot.day}
                        </div>
                        <div className="p-4">
                          {slot.times.map((time, timeIndex) => {
                            const isBooked = isSlotBooked(selectedTrainer.id, slot.day, time);
                            const isSelected = selectedSlot?.day === slot.day && selectedSlot?.time === time;
                            return (
                              <div key={timeIndex} className="flex items-center py-2 border-b last:border-0">
                                <Clock size={16} className={`mr-2 ${isBooked ? 'text-gray-400' : 'text-blue-600'}`} />
                                <span className={isBooked ? 'text-gray-400' : ''}>{time}</span>
                                <button 
                                  className={`ml-auto text-sm px-2 py-1 rounded transition-colors ${
                                    isBooked
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : isSelected
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                  }`}
                                  onClick={() => !isBooked && handleTimeSlotClick(slot.day, time)}
                                  disabled={isBooked}
                                >
                                  {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Book'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button 
                      className={`font-medium py-3 px-6 rounded transition-colors ${
                        selectedSlot
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={handleBookSession}
                      disabled={!selectedSlot}
                    >
                      {selectedSlot ? 'Confirm Booking' : 'Select a Time Slot'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessPage;