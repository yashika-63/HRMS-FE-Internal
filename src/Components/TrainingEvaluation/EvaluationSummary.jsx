import React from 'react';

function EvaluationSummary({ evaluations, onBack }) {
  return (
    <div className="card">
      <h2 className="card-title">Your Training Evaluations</h2>
      
      {evaluations.length === 0 ? (
        <p>You haven't submitted any evaluations yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Training</th>
              <th>Date Evaluated</th>
              <th>Content Rating</th>
              <th>Trainer Rating</th>
              <th>Overall Rating</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map(evalu => (
              <tr key={evalu.id}>
                <td>{evalu.trainingTitle}</td>
                <td>{evalu.date}</td>
                <td>{evalu.contentRating}/5</td>
                <td>{evalu.trainerRating}/5</td>
                <td>{evalu.overallRating}/5</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button 
        className="btn btn-secondary"
        onClick={onBack}
      >
        Back to Trainings
      </button>
    </div>
  );
}

export default EvaluationSummary;