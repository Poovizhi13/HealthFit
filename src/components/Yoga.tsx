import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './yoga-page.css';

interface Trainer {
  id: number;
  name: string;
  specialization: string;
  experience: string;
  imageUrl: string;
  slots: {
    day: string;
    times: string[];
  }[];
}

interface SelectedSlot {
  day: string;
  time: string;
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

const yogaTrainers: Trainer[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    specialization: "Hatha Yoga",
    experience: "8 years",
    imageUrl: "/api/placeholder/200/200",
    slots: [
      { day: "Monday", times: ["6:00 AM", "8:00 AM", "5:30 PM"] },
      { day: "Wednesday", times: ["7:00 AM", "4:30 PM", "6:30 PM"] },
      { day: "Friday", times: ["6:00 AM", "9:00 AM", "5:30 PM"] }
    ]
  },
  {
    id: 2,
    name: "Raj Patel",
    specialization: "Vinyasa Flow",
    experience: "10 years",
    imageUrl: "/api/placeholder/200/200",
    slots: [
      { day: "Tuesday", times: ["7:00 AM", "12:00 PM", "6:00 PM"] },
      { day: "Thursday", times: ["8:00 AM", "4:00 PM", "7:30 PM"] },
      { day: "Saturday", times: ["9:00 AM", "11:00 AM", "1:00 PM"] }
    ]
  },
  {
    id: 3,
    name: "Emma Chen",
    specialization: "Yin Yoga",
    experience: "6 years",
    imageUrl: "/api/placeholder/200/200",
    slots: [
      { day: "Monday", times: ["11:00 AM", "2:00 PM", "7:30 PM"] },
      { day: "Wednesday", times: ["10:00 AM", "1:00 PM", "6:00 PM"] },
      { day: "Saturday", times: ["8:30 AM", "10:30 AM", "4:00 PM"] }
    ]
  },
  {
    id: 4,
    name: "Miguel Santos",
    specialization: "Ashtanga Yoga",
    experience: "12 years",
    imageUrl: "/api/placeholder/200/200",
    slots: [
      { day: "Tuesday", times: ["5:30 AM", "9:00 AM", "5:00 PM"] },
      { day: "Thursday", times: ["6:00 AM", "12:00 PM", "4:30 PM"] },
      { day: "Sunday", times: ["7:00 AM", "9:00 AM", "11:00 AM"] }
    ]
  }
];

const YogaPage: React.FC = () => {
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load existing bookings from localStorage
    const storedBookings = localStorage.getItem('yogaBookings');
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

  const createGoogleCalendarUrl = (trainer: Trainer, slot: SelectedSlot) => {
    // Get the next occurrence of the selected day
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const selectedDayIndex = daysOfWeek.indexOf(slot.day);
    const currentDayIndex = today.getDay();
    let daysUntilNext = selectedDayIndex - currentDayIndex;
    if (daysUntilNext <= 0) daysUntilNext += 7;

    // Create the event date
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + daysUntilNext);
    
    // Parse the time
    const [hours, minutes] = slot.time.replace(/\s*(?:AM|PM)\s*$/i, '').split(':').map(Number);
    const isPM = slot.time.toLowerCase().includes('pm');
    
    // Set the correct hours in 24-hour format
    let eventHours = hours;
    if (isPM && hours !== 12) eventHours += 12;
    if (!isPM && hours === 12) eventHours = 0;
    
    eventDate.setHours(eventHours, minutes, 0, 0);
    
    // Event end time (1 hour later)
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1);

    // Create the calendar URL
    const event = {
      text: `Yoga Session with ${trainer.name}`,
      details: `${trainer.specialization} yoga class with ${trainer.name}`,
      location: 'Yoga Studio',
      dates: `${eventDate.toISOString()}/${endDate.toISOString()}`
    };

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.text)}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}&dates=${event.dates.replace(/[-:]/g, '')}`;

    return url;
  };

  const handleTimeSlotClick = (day: string, time: string) => {
    setSelectedSlot({ day, time });
  };

  const isSlotBooked = (trainerId: number, day: string, time: string) => {
    return bookings.some(booking => 
      booking.trainerId === trainerId && 
      booking.date === day && 
      booking.time === time &&
      booking.status === 'upcoming'
    );
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
      localStorage.setItem('yogaBookings', JSON.stringify(updatedBookings));

      // Store in trainer's bookings
      const trainerBookings = localStorage.getItem(`bookings_${selectedTrainer.id}`) || '[]';
      const parsedTrainerBookings = JSON.parse(trainerBookings);
      localStorage.setItem(
        `bookings_${selectedTrainer.id}`, 
        JSON.stringify([...parsedTrainerBookings, newBooking])
      );

      // Show confirmation
      alert('Session booked successfully! Check your Google Calendar for the event.');

      // Create Google Calendar event
      const calendarUrl = createGoogleCalendarUrl(selectedTrainer, selectedSlot);
      window.open(calendarUrl, '_blank');

      // Close the modal
      closeTrainerDetails();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-teal-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Yoga Classes</h1>
          <p className="mt-2 text-lg">Find your perfect yoga instructor and book a session</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Our Yoga Instructors</h2>
          <button
            onClick={handleTrainerLogin}
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition-colors"
          >
            Instructor Login
          </button>
        </div>
        
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {yogaTrainers.map((trainer) => (
              <div 
                key={trainer.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleTrainerClick(trainer)}
              >
                <img 
                  src={trainer.imageUrl} 
                  alt={`${trainer.name} - Yoga Instructor`} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800">{trainer.name}</h3>
                  <p className="text-teal-600 font-medium">{trainer.specialization}</p>
                  <p className="text-gray-600">{trainer.experience} experience</p>
                  <div className="mt-4 flex items-center text-gray-500">
                    <Calendar size={16} className="mr-1" />
                    <span className="text-sm">{trainer.slots.length} days available</span>
                  </div>
                  <button 
                    className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded transition-colors"
                  >
                    View Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Trainer Details Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedTrainer.name}</h2>
                  <p className="text-teal-600 font-medium">{selectedTrainer.specialization}</p>
                </div>
                <button 
                  onClick={closeTrainerDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <img 
                  src={selectedTrainer.imageUrl} 
                  alt={selectedTrainer.name} 
                  className="w-full md:w-1/3 h-64 object-cover rounded"
                />
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">About</h3>
                  <p className="text-gray-600 mb-4">
                    {selectedTrainer.name} is a certified {selectedTrainer.specialization} instructor with {selectedTrainer.experience} of experience.
                    They focus on proper alignment, mindful movement, and creating a supportive environment for all students.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3">Available Sessions</h3>
                  <div className="space-y-4">
                    {selectedTrainer.slots.map((slot, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="font-medium text-gray-800 mb-2">{slot.day}</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {slot.times.map((time, timeIndex) => {
                            const isBooked = isSlotBooked(selectedTrainer.id, slot.day, time);
                            return (
                              <button
                                key={timeIndex}
                                onClick={() => !isBooked && handleTimeSlotClick(slot.day, time)}
                                disabled={isBooked}
                                className={`flex items-center p-2 rounded ${
                                  isBooked 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : selectedSlot?.day === slot.day && selectedSlot?.time === time
                                      ? 'bg-teal-100 text-teal-700 border-teal-500'
                                      : 'hover:bg-gray-100'
                                }`}
                              >
                                <Clock size={16} className={`mr-1 ${isBooked ? 'text-gray-400' : 'text-teal-500'}`} />
                                <span>{time}</span>
                                {isBooked && <span className="ml-1 text-xs">(Booked)</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className={`mt-6 w-full py-3 rounded font-medium transition-colors ${
                      selectedSlot
                        ? 'bg-teal-500 hover:bg-teal-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={handleBookSession}
                    disabled={!selectedSlot}
                  >
                    {selectedSlot ? 'Book Selected Session' : 'Select a Time Slot'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YogaPage;