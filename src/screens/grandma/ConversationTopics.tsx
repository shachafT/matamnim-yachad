import { useApp } from '../../context/AppContext';
import { getWorkoutForProfile } from '../../data/exercises';

const generalTopics = [
  { label: 'זיכרון', text: 'מה הייתה הפעילות הגופנית האהובה עלייך כשהיית צעירה?' },
  { label: 'זיכרון', text: 'האם פעם למדת ריקוד? איזה?' },
  { label: 'שאלה קלילה', text: 'מה הדבר הכי טעים שבישלת השבוע?' },
  { label: 'שאלה קלילה', text: 'מה הצחיק אותך לאחרונה?' },
  { label: 'על הנכד', text: 'מה אני יכול/ה ללמד אותך השבוע?' },
  { label: 'חיבור', text: 'מתי נוכל לדבר בוידאו? כבר מתגעגע/ת אלייך!' },
];

export default function ConversationTopics() {
  const { state, navigate } = useApp();
  const { grandmaProfile } = state;
  const exercises = getWorkoutForProfile(grandmaProfile.difficulties, grandmaProfile.fitnessLevel);
  const workoutTopics = exercises.map((ex) => ({
    label: 'מהאימון',
    text: ex.conversationStarter,
  }));
  const allTopics = [...workoutTopics, ...generalTopics];

  return (
    <div className="conversation-screen screen">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('grandma-home')} aria-label="חזרה">›</button>
        <div>
          <h2 style={{ marginBottom: 0 }}>דברי עם הנכד/ה</h2>
          <p className="text-small">נושאים לשיחה מהאימון ומהחיים</p>
        </div>
      </div>

      <div
        className="card card-warm"
        style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}
      >
        <p style={{ fontSize: 'var(--text-lg)' }}>
          💬 בחרי נושא שיחה, ושתפי אותו עם {grandmaProfile.grandchildName}
        </p>
      </div>

      {allTopics.map((topic, i) => (
        <div key={i} className="topic-card">
          <div className="topic-label">{topic.label}</div>
          <div className="topic-text">{topic.text}</div>
        </div>
      ))}

      <div style={{ marginTop: 'var(--space-6)' }}>
        <button className="btn btn-primary" onClick={() => navigate('grandma-home')}>
          חזרה לבית
        </button>
      </div>
    </div>
  );
}
