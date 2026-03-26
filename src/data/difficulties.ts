import { Difficulty } from '../types';

export interface DifficultyInfo {
  id: Difficulty;
  label: string;
  description: string;
  solution: string;
  emoji: string;
}

export const DIFFICULTIES: DifficultyInfo[] = [
  {
    id: 'vision',
    label: 'בעיות ראייה',
    description: 'קושי לקרוא טקסט קטן',
    solution: 'טקסט גדול, ניגודיות גבוהה, הקראה קולית',
    emoji: '👁️',
  },
  {
    id: 'hearing',
    label: 'בעיות שמיעה',
    description: 'קושי לשמוע הוראות',
    solution: 'כתוביות, שליטה בווליום',
    emoji: '👂',
  },
  {
    id: 'blood_pressure',
    label: 'לחץ דם גבוה',
    description: 'רגישות למאמץ וסחרחורת',
    solution: 'אימונים עדינים, קצב איטי, הפסקות',
    emoji: '🫀',
  },
  {
    id: 'diabetes',
    label: 'סוכרת',
    description: 'תלות בתזמון אוכל ואנרגיה',
    solution: 'אימונים קצרים, תזמון מותאם',
    emoji: '🩺',
  },
  {
    id: 'joint_pain',
    label: 'כאבי מפרקים',
    description: 'כאב ונוקשות בתנועה',
    solution: 'תרגילי כיסא, עומס נמוך',
    emoji: '🦵',
  },
  {
    id: 'balance',
    label: 'שיווי משקל ירוד',
    description: 'פחד מנפילות וחוסר יציבות',
    solution: 'אימונים בישיבה, תמיכה',
    emoji: '⚖️',
  },
  {
    id: 'cognitive',
    label: 'שכחה / ירידה קוגניטיבית',
    description: 'קושי לזכור ולבצע רצף',
    solution: 'שלבים ברורים, חזרתיות',
    emoji: '🧠',
  },
  {
    id: 'tech',
    label: 'קושי טכנולוגי',
    description: 'חוסר ביטחון עם אפליקציות',
    solution: 'מסך אחד, פעולה אחת',
    emoji: '📱',
  },
  {
    id: 'fatigue',
    label: 'עייפות',
    description: 'קושי להתמיד בפעילות',
    solution: 'חיזוקים רגשיים, אימונים קצרים',
    emoji: '😴',
  },
  {
    id: 'loneliness',
    label: 'בדידות',
    description: 'חוסר קשר חברתי יומיומי',
    solution: 'שיתוף עם הנכד, תוכן לשיחה',
    emoji: '🤍',
  },
  {
    id: 'fear_failure',
    label: 'פחד מכישלון',
    description: 'חשש מטעויות',
    solution: 'שפה מעודדת, ללא שיפוטיות',
    emoji: '💪',
  },
];
