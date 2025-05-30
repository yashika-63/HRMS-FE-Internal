import React from 'react';

function TrainingList({ trainings, onEvaluate, onViewSummary }) {
  const completedTrainings = trainings.filter(t => t.status === 'completed');

  return (
    <div>
      <h2 className="header">Training Evaluation</h2>
      
      <div className="card">
        <h3 className="card-title">Available Trainings for Evaluation</h3>
        
        {completedTrainings.length === 0 ? (
          <p>No trainings available for evaluation at this time.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Date</th>
                <th>Trainer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {completedTrainings.map(training => (
                <tr key={training.id}>
                  <td>{training.title}</td>
                  <td>{training.description}</td>
                  <td>{training.date}</td>
                  <td>{training.trainer}</td>
                  <td>
                    <button 
                      className="btn"
                      onClick={() => onEvaluate(training)}
                    >
                      Evaluate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 className="card-title">Evaluation Summary</h3>
        <p>View your previously submitted evaluations</p>
        <button 
          className="btn btn-secondary"
          onClick={onViewSummary}
        >
          View Summary
        </button>
      </div>
    </div>
  );
}

export default TrainingList;