import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Acknowledgement.css';

const Acknowledgement: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!selectedOption) {
      alert("Please select either Yoga or Fitness.");
      return;
    }
    
    // Navigate based on user's choice
    navigate(`/${selectedOption.toLowerCase()}`);
  };

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  return (
    <div className="ack-container">
      <h2>Choose Your Wellness Path</h2>
      <form className="ack-form" onSubmit={(e) => e.preventDefault()}>
        <div className="option-container">
          <label className="ack-option">
            <input
              type="radio"
              name="wellnessOption"
              checked={selectedOption === 'Yoga'}
              onChange={() => handleOptionChange('Yoga')}
            />
            <span className="option-text">Yoga</span>
          </label>

          <label className="ack-option">
            <input
              type="radio"
              name="wellnessOption"
              checked={selectedOption === 'Fitness'}
              onChange={() => handleOptionChange('Fitness')}
            />
            <span className="option-text">Fitness</span>
          </label>
        </div>

        {/* Additional input field that appears when an option is selected */}
        {selectedOption && (
          <div className="additional-info">
            <textarea
              placeholder={`Please share any additional preferences or notes for your ${selectedOption} plan...`}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="additional-input"
              rows={4}
            />
          </div>
        )}

        <button type="button" className="ack-submit" onClick={handleSubmit}>
          Continue to {selectedOption || 'Selected'} Path
        </button>
      </form>
    </div>
  );
};

export default Acknowledgement;