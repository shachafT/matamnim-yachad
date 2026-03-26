import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getWorkoutForProfile } from '../../data/exercises';

export default function Workout() {
  const { state, navigate, addWorkout } = useApp();
  const { grandmaProfile } = state;
  const exercises = getWorkoutForProfile(grandmaProfile.difficulties, grandmaProfile.fitnessLevel);
  const useChair =
    grandmaProfile.difficulties.includes('balance') ||
    grandmaProfile.difficulties.includes('joint_pain');

  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  const exercise = exercises[exerciseIdx];
  const steps = useChair ? exercise.chairSteps : exercise.steps;
  const progress = ((exerciseIdx) / exercises.length) * 100;

  const nextStep = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else if (exerciseIdx < exercises.length - 1) {
      setExerciseIdx(exerciseIdx + 1);
      setStepIdx(0);
    } else {
      setDone(true);
      addWorkout({
        date: new Date().toISOString().split('T')[0],
        duration: exercises.length * 2,
        exerciseCount: exercises.length,
        type: useChair ? 'כיסא' : 'עמידה',
      });
      navigate('grandma-workout-summary');
    }
  };

  const prevStep = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
    } else if (exerciseIdx > 0) {
      setExerciseIdx(exerciseIdx - 1);
      const prevEx = exercises[exerciseIdx - 1];
      const prevSteps = useChair ? prevEx.chairSteps : prevEx.steps;
      setStepIdx(prevSteps.length - 1);
    }
  };

  if (done) return null;

  return (
    <div className="workout-screen">
      {/* Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <button className="back-btn" onClick={() => navigate('grandma-home')} aria-label="חזרה לבית">
          ›
        </button>
        <span style={{ fontSize: 'var(--text-base)', color: 'var(--mid)' }}>
          תרגיל {exerciseIdx + 1} מתוך {exercises.length}
        </span>
        {useChair && (
          <span className="tag tag-accent" style={{ marginRight: 'auto', marginLeft: 0 }}>
            🪑 גרסת כיסא
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="workout-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="workout-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Exercise card */}
      <div className="exercise-card">
        <span className="exercise-emoji" role="img" aria-hidden="true">
          {exercise.emoji}
        </span>
        <h2 className="exercise-name">{exercise.name}</h2>

        <div className="step-counter">
          שלב {stepIdx + 1} מתוך {steps.length}
        </div>
        <div className="exercise-current-step" aria-live="polite">
          {steps[stepIdx]}
        </div>
      </div>

      {/* Safety note */}
      {exercise.safetyNote && (
        <div className="safety-note" role="note">
          <span>⚠️</span>
          <span>{exercise.safetyNote}</span>
        </div>
      )}

      {/* Global safety */}
      <div className="safety-note" role="note">
        <span>💛</span>
        <span>אם חשה כאב חד, סחרחורת או קושי חריג – עצרי מיד</span>
      </div>

      {/* Controls */}
      <div className="workout-controls">
        <button className="btn btn-primary" onClick={nextStep} aria-label="הבא">
          {exerciseIdx === exercises.length - 1 && stepIdx === steps.length - 1
            ? '✅ סיימתי!'
            : stepIdx < steps.length - 1
            ? 'הבא ›'
            : `תרגיל הבא: ${exercises[exerciseIdx + 1]?.name || ''} ›`}
        </button>
        {(exerciseIdx > 0 || stepIdx > 0) && (
          <button className="btn btn-secondary" onClick={prevStep} aria-label="חזור">
            ‹ חזרה
          </button>
        )}
        <button
          className="btn btn-ghost"
          onClick={() => navigate('grandma-home')}
          aria-label="עצירה"
          style={{ color: 'var(--mid)' }}
        >
          עצירה
        </button>
      </div>
    </div>
  );
}
