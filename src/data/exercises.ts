import { Difficulty } from '../types';

export interface Exercise {
  id: string;
  name: string;
  emoji: string;
  durationSeconds: number;
  steps: string[];
  chairSteps: string[];
  category: 'breathing' | 'warmup' | 'strength' | 'stretch' | 'balance';
  contraindications: Difficulty[];
  safetyNote?: string;
  conversationStarter: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: 'deep_breath',
    name: 'נשימות עמוקות',
    emoji: '🌬️',
    durationSeconds: 60,
    category: 'breathing',
    steps: [
      'שב/י בנוחות על כיסא',
      'שאפ/י לאט עד 4 שניות',
      'עצור/י את הנשימה 2 שניות',
      'נשוף/י לאט עד 6 שניות',
      'חזור/י 5 פעמים',
    ],
    chairSteps: [
      'שב/י בנוחות על כיסא',
      'שאפ/י לאט עד 4 שניות',
      'עצור/י את הנשימה 2 שניות',
      'נשוף/י לאט עד 6 שניות',
      'חזור/י 5 פעמים',
    ],
    contraindications: [],
    safetyNote: 'אם חשה סחרחורת – עצרי ונסי שוב מאוחר יותר',
    conversationStarter: 'איפה הכי נעים לך לנשום עמוק – בבית או בגינה?',
  },
  {
    id: 'shoulder_rolls',
    name: 'סיבובי כתפיים',
    emoji: '🔄',
    durationSeconds: 60,
    category: 'warmup',
    steps: [
      'שב/י ישר על כיסא',
      'הרם/י את שתי הכתפיים למעלה',
      'סובב/י לאחור במעגל עדין',
      'חזור/י 8 פעמים',
      'עכשיו סובב/י קדימה 8 פעמים',
    ],
    chairSteps: [
      'שב/י ישר על כיסא',
      'הרם/י את שתי הכתפיים למעלה',
      'סובב/י לאחור במעגל עדין',
      'חזור/י 8 פעמים',
    ],
    contraindications: [],
    conversationStarter: 'מה גרם לך הכי הרבה מתח בכתפיים השבוע?',
  },
  {
    id: 'neck_stretch',
    name: 'מתיחת צוואר עדינה',
    emoji: '🌸',
    durationSeconds: 60,
    category: 'stretch',
    steps: [
      'שב/י ישר, כתפיים רפויות',
      'הטי/י את הראש לצד ימין בעדינות',
      'החזק/י 10 שניות',
      'חזור/י למרכז',
      'הטי/י לצד שמאל',
      'החזק/י 10 שניות',
    ],
    chairSteps: [
      'שב/י ישר, כתפיים רפויות',
      'הטי/י את הראש לצד ימין בעדינות',
      'החזק/י 10 שניות',
      'חזור/י למרכז',
    ],
    contraindications: [],
    safetyNote: 'תנועות עדינות בלבד – אל תסובב/י את הראש מעגלים מלאים',
    conversationStarter: 'האם עשית כשטרחה בגוף שלך לפעמים גרמה לה לצוואר כואב?',
  },
  {
    id: 'seated_march',
    name: 'צעדים בישיבה',
    emoji: '🦶',
    durationSeconds: 90,
    category: 'warmup',
    steps: [
      'שב/י על קצה הכיסא',
      'הרם/י את הברך הימנית',
      'הורד/י בחזרה',
      'הרם/י את הברך השמאלית',
      'המשך/י בקצב נוח כ-20 צעדים',
    ],
    chairSteps: [
      'שב/י בביטחה על הכיסא',
      'הרם/י רגל אחת בעדינות',
      'הורד/י בחזרה',
      'חלופי/י רגליים 10 פעמים',
    ],
    contraindications: [],
    conversationStarter: 'לאן הכי בא לך ללכת לטייל היום?',
  },
  {
    id: 'hand_squeeze',
    name: 'חיזוק ידיים',
    emoji: '✊',
    durationSeconds: 60,
    category: 'strength',
    steps: [
      'שב/י בנוחות',
      'פשט/י את האצבעות',
      'קפוץ/י לאגרוף חזק',
      'החזק/י 3 שניות',
      'פתח/י לאט',
      'חזור/י 10 פעמים',
    ],
    chairSteps: [
      'שב/י בנוחות',
      'קפוץ/י לאגרוף רך',
      'פתח/י לאט',
      'חזור/י 8 פעמים',
    ],
    contraindications: [],
    conversationStarter: 'מה הדבר האחרון שהכנת עם הידיים שלך?',
  },
  {
    id: 'ankle_circles',
    name: 'סיבובי קרסול',
    emoji: '🔁',
    durationSeconds: 60,
    category: 'warmup',
    steps: [
      'שב/י על כיסא',
      'הרם/י את כף הרגל הימנית',
      'סובב/י את הקרסול במעגל – 8 פעמים',
      'החלף/י כיוון – 8 פעמים',
      'חזור/י עם הרגל השמאלית',
    ],
    chairSteps: [
      'שב/י על כיסא',
      'הרם/י רגל מעט מהרצפה',
      'סובב/י כף הרגל בעדינות',
      'חזור/י 6 פעמים',
    ],
    contraindications: [],
    conversationStarter: 'מה נעים לך יותר – נעלי בית רכות או גרביים חמות?',
  },
  {
    id: 'arm_raise',
    name: 'הרמת ידיים',
    emoji: '🙌',
    durationSeconds: 60,
    category: 'strength',
    steps: [
      'שב/י ישר',
      'הרם/י את שתי הידיים לצדדים לאט',
      'עד גובה הכתפיים',
      'החזק/י 3 שניות',
      'הורד/י לאט',
      'חזור/י 8 פעמים',
    ],
    chairSteps: [
      'שב/י ישר',
      'הרם/י יד אחת לצד בעדינות',
      'הורד/י לאט',
      'חזור/י 6 פעמים לכל יד',
    ],
    contraindications: ['blood_pressure'],
    safetyNote: 'אל תרים/י את הידיים מעל ראש',
    conversationStarter: 'מה אהבת לעשות עם הידיים שלך כשהיית צעירה?',
  },
  {
    id: 'back_stretch',
    name: 'מתיחת גב עדינה',
    emoji: '🌿',
    durationSeconds: 60,
    category: 'stretch',
    steps: [
      'שב/י ישר על כיסא',
      'אחז/י בשתי ידיים את מסעד הכיסא',
      'עגל/י את הגב קצת קדימה',
      'ואז פשוט/י חזרה',
      'חזור/י 5 פעמים',
    ],
    chairSteps: [
      'שב/י ישר',
      'נשוף/י ועגל/י את הגב בעדינות',
      'שאף/י ופשוט/י',
      'חזור/י 5 פעמים',
    ],
    contraindications: [],
    conversationStarter: 'האם יש עמדה שנוחה לך במיוחד לישון?',
  },
];

export const getWorkoutForProfile = (
  difficulties: Difficulty[],
  level: 'easy' | 'medium'
): Exercise[] => {
  const hasHighRisk = difficulties.includes('balance') || difficulties.includes('joint_pain');
  const hasBP = difficulties.includes('blood_pressure');

  let pool = EXERCISES.filter(
    (ex) => !ex.contraindications.some((c) => difficulties.includes(c))
  );

  if (hasHighRisk) {
    // Only seated exercises
    pool = pool.filter((ex) => ex.chairSteps.length > 0);
  }

  if (hasBP) {
    pool = pool.filter((ex) => ex.id !== 'arm_raise');
  }

  const count = level === 'easy' ? 4 : 6;
  // Always start with breathing, end with stretch
  const breathing = pool.filter((e) => e.category === 'breathing');
  const middle = pool.filter((e) => e.category !== 'breathing' && e.category !== 'stretch');
  const stretches = pool.filter((e) => e.category === 'stretch');

  const selected = [
    ...breathing.slice(0, 1),
    ...middle.slice(0, count - 2),
    ...stretches.slice(0, 1),
  ];

  return selected.length >= 2 ? selected : pool.slice(0, count);
};
