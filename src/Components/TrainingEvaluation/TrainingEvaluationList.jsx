import React, { useState } from 'react';
import './TrainingMain.css';
import './Forms.css';
import TrainingList from './TrainingList';
import EvaluationForm from './EvaluationForm';
import EvaluationSummary from './EvaluationSummary';

function TrainingEvaluationList() {
  const [view, setView] = useState('trainings');
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [message, setMessage] = useState(null);

  // Mock data for trainings
  const [trainings, setTrainings] = useState([
    {
      id: 1,
      title: 'Leadership Skills Workshop',
      description: 'Developing essential leadership skills for managers',
      date: '2023-06-15',
      duration: '2 days',
      trainer: 'John Smith',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Effective Communication',
      description: 'Improving communication skills in the workplace',
      date: '2023-07-10',
      duration: '1 day',
      trainer: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Project Management Fundamentals',
      description: 'Core concepts of project management',
      date: '2023-08-05',
      duration: '3 days',
      trainer: 'Michael Brown',
      status: 'upcoming'
    }
  ]);

  const handleEvaluate = (training) => {
    setSelectedTraining(training);
    setView('evaluation-form');
  };

  const handleSubmitEvaluation = (evaluationData) => {
    // In a real app, this would be an API call
    const newEvaluation = {
      id: evaluations.length + 1,
      trainingId: selectedTraining.id,
      trainingTitle: selectedTraining.title,
      date: new Date().toISOString().split('T')[0],
      ...evaluationData
    };
    
    setEvaluations([...evaluations, newEvaluation]);
    setMessage('Evaluation submitted successfully!');
    setTimeout(() => setMessage(null), 3000);
    setView('summary');
  };

  const handleViewSummary = () => {
    setView('summary');
  };

  const handleBackToList = () => {
    setView('trainings');
  };

  return (
    <div className="App">
      <div className="container">
        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {view === 'trainings' && (
          <TrainingList 
            trainings={trainings} 
            onEvaluate={handleEvaluate}
            onViewSummary={handleViewSummary}
          />
        )}

        {view === 'evaluation-form' && selectedTraining && (
          <EvaluationForm 
            training={selectedTraining}
            onSubmit={handleSubmitEvaluation}
            onCancel={handleBackToList}
          />
        )}

        {view === 'summary' && (
          <EvaluationSummary 
            evaluations={evaluations}
            onBack={handleBackToList}
          />
        )}
      </div>
    </div>
  );
}

export default TrainingEvaluationList;