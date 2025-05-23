import React, { useState } from 'react';

function EvaluationForm({ training, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contentRating: '',
    trainerRating: '',
    organizationRating: '',
    overallRating: '',
    comments: '',
    suggestions: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card">
      <h2 className="card-title">Evaluation for: {training.title}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">1. How would you rate the training content?</label>
          <div className="rating-scale">
            {[1, 2, 3, 4, 5].map(num => (
              <div className="radio-option" key={`content-${num}`}>
                <input
                  type="radio"
                  id={`content-${num}`}
                  name="contentRating"
                  value={num}
                  checked={formData.contentRating === num.toString()}
                  onChange={handleChange}
                  required
                />
                <label htmlFor={`content-${num}`}>{num}</label>
              </div>
            ))}
          </div>
          <small>(1 = Poor, 5 = Excellent)</small>
        </div>

        <div className="form-group">
          <label className="form-label">2. How would you rate the trainer's effectiveness?</label>
          <div className="rating-scale">
            {[1, 2, 3, 4, 5].map(num => (
              <div className="radio-option" key={`trainer-${num}`}>
                <input
                  type="radio"
                  id={`trainer-${num}`}
                  name="trainerRating"
                  value={num}
                  checked={formData.trainerRating === num.toString()}
                  onChange={handleChange}
                  required
                />
                <label htmlFor={`trainer-${num}`}>{num}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">3. How would you rate the organization and logistics?</label>
          <div className="rating-scale">
            {[1, 2, 3, 4, 5].map(num => (
              <div className="radio-option" key={`org-${num}`}>
                <input
                  type="radio"
                  id={`org-${num}`}
                  name="organizationRating"
                  value={num}
                  checked={formData.organizationRating === num.toString()}
                  onChange={handleChange}
                  required
                />
                <label htmlFor={`org-${num}`}>{num}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">4. Overall rating of the training program</label>
          <div className="rating-scale">
            {[1, 2, 3, 4, 5].map(num => (
              <div className="radio-option" key={`overall-${num}`}>
                <input
                  type="radio"
                  id={`overall-${num}`}
                  name="overallRating"
                  value={num}
                  checked={formData.overallRating === num.toString()}
                  onChange={handleChange}
                  required
                />
                <label htmlFor={`overall-${num}`}>{num}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">5. What did you like most about the training?</label>
          <textarea
            className="form-control"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">6. Suggestions for improvement</label>
          <textarea
            className="form-control"
            name="suggestions"
            value={formData.suggestions}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <button type="submit" className="btn">
            Submit Evaluation
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EvaluationForm;