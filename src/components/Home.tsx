import React, { useState } from 'react';
import { Users, Calendar, Activity, User, Bell, Menu, X, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Define interfaces for your component props and any other types
interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PathwayProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonColor: string;
  iconBgColor: string;
  iconColor: string;
}

// Feature component with typed props
const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="relative">
      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
        {icon}
      </div>
      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{title}</p>
      <p className="mt-2 ml-16 text-base text-gray-500">{description}</p>
    </div>
  );
};

// Pathway component with typed props
const Pathway: React.FC<PathwayProps> = ({ 
  icon, 
  title, 
  description, 
  features, 
  buttonText, 
  buttonColor, 
  iconBgColor, 
  iconColor 
}) => {
  const navigate = useNavigate();

  const handlePathwayClick = () => {
    // Navigate to the appropriate path based on the title
    if (title === "Yoga Journey") {
      navigate('/yoga');
    } else if (title === "Fitness Journey") {
      navigate('/fitness');
    }
  };

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg">
      <div className={`absolute -top-4 -left-4 ${iconBgColor} rounded-full p-3`}>
        {icon}
      </div>
      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{title}</h3>
      <p className="mt-5 text-base text-gray-500">{description}</p>
      <ul className="mt-4 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className={`h-4 w-4 ${iconColor}`} />
            <span className="ml-2 text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={handlePathwayClick}
        className={`mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${buttonColor}`}
      >
        {buttonText}
      </button>
    </div>
  );
};

// Main HomePage component
const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Features data
  const features: FeatureProps[] = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Personalized Accounts",
      description: "Create a unique profile to access personalized features and track your wellness journey."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Class Scheduling",
      description: "Book, reschedule, or cancel your fitness classes with ease and convenience."
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Monitor your performance and track your progress toward your wellness goals."
    },
    {
      icon: <User className="h-6 w-6" />,
      title: "Trainer Portal",
      description: "Special access for trainers to manage classes and monitor client progress."
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Notifications",
      description: "Stay updated with important information and reminders about your schedule."
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Health Details",
      description: "View and manage your health information to optimize your wellness journey."
    }
  ];

  // Pathways data
  const pathways: PathwayProps[] = [
    {
      icon: <User className="h-6 w-6 text-white" />,
      title: "Yoga Journey",
      description: "Focus on mindfulness, flexibility, and spiritual wellness through our comprehensive yoga programs.",
      features: ["Meditation sessions", "Breathing techniques", "Asana practices"],
      buttonText: "Explore Yoga",
      buttonColor: "bg-green-600 hover:bg-green-700",
      iconBgColor: "bg-green-500",
      iconColor: "text-green-500"
    },
    {
      icon: <Activity className="h-6 w-6 text-white" />,
      title: "Fitness Journey",
      description: "Build strength, endurance, and achieve your physical goals with our personalized fitness programs.",
      features: ["Strength training", "Cardio workouts", "Nutrition guidance"],
      buttonText: "Explore Fitness",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      iconBgColor: "bg-blue-500",
      iconColor: "text-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">FitWell</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </Link>
                <Link to="/about" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About
                </Link>
                <Link to="/classes" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Classes
                </Link>
                <Link to="/trainer-login" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Trainers
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <a href="http://localhost:5173/login" className="inline-block">
              <button className="bg-indigo-600 px-4 py-2 rounded-md text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign In
              </button>
              </a>
              <a href=" http://localhost:5173/register" className="inline-block">
              <button className="ml-4 bg-white px-4 py-2 rounded-md text-indigo-600 font-medium border border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign Up
              </button>
              </a>
            </div>
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <a href="#" className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                Home
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                About
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                Classes
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                Trainers
              </a>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <button className="w-full bg-indigo-600 px-4 py-2 rounded-md text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Sign In
                  </button>
                </div>
                <div className="ml-3">
                  <button className="w-full bg-white px-4 py-2 rounded-md text-indigo-600 font-medium border border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:flex lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Your Wellness Journey Starts Here
            </h2>
            <p className="mt-5 text-xl text-indigo-100">
              A comprehensive platform for managing your fitness and yoga journey, all in one place.
            </p>
            <div className="mt-8 flex">
              <div className="inline-flex rounded-md shadow">
                <a href="#" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
                  Get started
                </a>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <a href="#" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600">
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pathways Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Pathways</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Choose Your Wellness Journey
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We offer specialized programs for both yoga enthusiasts and fitness seekers.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Map through pathways */}
              {pathways.map((pathway, index) => (
                <Pathway
                  key={index}
                  icon={pathway.icon}
                  title={pathway.title}
                  description={pathway.description}
                  features={pathway.features}
                  buttonText={pathway.buttonText}
                  buttonColor={pathway.buttonColor}
                  iconBgColor={pathway.iconBgColor}
                  iconColor={pathway.iconColor}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need In One Place
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform offers comprehensive tools for both clients and trainers.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Map through features */}
              {features.map((feature, index) => (
                <Feature
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start your wellness journey?</span>
            <span className="block">Sign up today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join our community of wellness enthusiasts and take the first step toward a healthier lifestyle.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <a href="#" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
                Sign Up Now
              </a>
            </div>
            <div className="ml-3 inline-flex">
              <a href="#" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="flex flex-wrap justify-center">
            {['About', 'Classes', 'Trainers', 'Pricing', 'Contact', 'Privacy', 'Terms'].map((item) => (
              <div key={item} className="px-5 py-2">
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                  {item}
                </a>
              </div>
            ))}
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2025 FitWell. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;