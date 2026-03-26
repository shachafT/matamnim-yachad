import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WORKOUTS, getStepsForWorkout } from '../../data/workoutsData';
import { getLinkedGrandmaId, saveScheduledWorkout, removeScheduledWorkout } from '../../lib/workoutScheduleService';

const HEB_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function dateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${day}/${month}`;
}

function getDayName(isoDate: string): string {
  const d = new Date(isoDate);
  return HEB_DAYS[d.getDay()];
}

/** Compact step card shown inside the workout-structure preview */
function StepCard({ order, title, durationOrReps, shortDescription, accent }: {
  order: number;
  title: string;
  durationOrReps: string;
  shortDescription: string;
  accent: string;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'white',
      border: `1.5px solid ${accent}33`,
      borderRight: `3px solid ${accent}`,
      borderRadius: 10,
      padding: '10px 12px',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: accent + '22',
        color: accent,
        fontSize: 11, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {order}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#2C2C2C', lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 2, lineHeight: 1.3 }}>
          {shortDescription}
        </div>
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700,
        color: accent,
        background: accent + '15',
        borderRadius: 6,
        padding: '3px 7px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        {durationOrReps}
      </div>
    </div>
  );
}

/** Inline workout-structure panel */
function WorkoutStructurePanel({ workoutId, accent }: { workoutId: string; accent: string }) {
  const steps = useMemo(() => getStepsForWorkout(workoutId), [workoutId]);
  return (
    <div style={{
      padding: '10px 4px 4px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      animation: 'screenIn 0.18s ease',
    }}>
      {steps.map(s => (
        <StepCard
          key={s.order}
          order={s.order}
          title={s.title}
          durationOrReps={s.durationOrReps}
          shortDescription={s.shortDescription}
          accent={accent}
        />
      ))}
    </div>
  );
}

export default function WeeklyPlanner() {
  const { state, navigate, scheduleWorkout, clearScheduledWorkout } = useApp();
  const { weeklySchedule, grandmaProfile, user } = state;

  const [planWeeks,    setPlanWeeks]    = useState<1 | 2 | 3 | 4>(1);
  const [openDay,      setOpenDay]      = useState<string | null>(null);
  const [savedDay,     setSavedDay]     = useState<string | null>(null);
  const [structureOpen, setStructureOpen] = useState<string | null>(null);
  const [linkedGrandmaId, setLinkedGrandmaId] = useState<string | null>(null);

  const days = useMemo(() => Array.from({ length: planWeeks * 7 }, (_, i) => dateStr(i)), [planWeeks]);
  const today = days[0];

  useEffect(() => {
    if (!user?.id) return;
    getLinkedGrandmaId(user.id).then(setLinkedGrandmaId);
  }, [user?.id]);

  const getScheduled = (date: string) =>
    weeklySchedule.find(s => s.date === date);

  const handlePick = (date: string, workoutId: string) => {
    scheduleWorkout(date, workoutId);      // local state for immediate UI
    console.log('[WeeklyPlanner] handlePick linkedGrandmaId=', linkedGrandmaId, 'date=', date, 'workoutId=', workoutId);
    if (linkedGrandmaId) {
      saveScheduledWorkout(linkedGrandmaId, date, workoutId)
        .then(r => console.log('[WeeklyPlanner] save result:', r));
    }
    setOpenDay(null);
    setStructureOpen(null);
    setSavedDay(date);
    setTimeout(() => setSavedDay(null), 1800);
  };

  const handleClear = (date: string) => {
    clearScheduledWorkout(date);           // local state
    if (linkedGrandmaId) removeScheduledWorkout(linkedGrandmaId, date);
    setOpenDay(null);
    setStructureOpen(null);
  };

  const toggleStructure = (workoutId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStructureOpen(prev => prev === workoutId ? null : workoutId);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', direction: 'rtl' }}>

      {/* Header */}
      <div style={{
        padding: '40px 24px 20px',
        background: 'linear-gradient(170deg, #FFFCF7 0%, #FAF0E6 100%)',
        borderBottom: '1.5px solid var(--light)',
      }}>
        <button className="back-btn" onClick={() => navigate('grandchild-home')} style={{ marginBottom: 16 }}>›</button>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>
          תכנון אימונים
        </h1>
        <p style={{ color: 'var(--mid)', fontSize: 'var(--text-base)', marginBottom: 16 }}>
          קבעי אימונים ל{grandmaProfile.name}
        </p>
        {/* Plan length selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          {([1, 2, 3, 4] as const).map(w => (
            <button key={w} onClick={() => setPlanWeeks(w)} style={{
              padding: '7px 14px', borderRadius: 20,
              border: planWeeks === w ? '2px solid var(--terracotta)' : '1.5px solid var(--light)',
              background: planWeeks === w ? 'var(--terracotta)' : 'white',
              color: planWeeks === w ? 'white' : 'var(--mid)',
              fontSize: 'var(--text-sm)', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.15s ease',
            }}>
              {w === 1 ? 'שבוע' : w === 4 ? 'חודש' : `${w} שבועות`}
            </button>
          ))}
        </div>
      </div>

      {/* Day cards */}
      <div style={{ padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {days.map((date, idx) => {
          const weekNum = Math.floor(idx / 7) + 1;
          const isFirstDayOfWeek = idx % 7 === 0;
          const showWeekHeader = planWeeks > 1 && isFirstDayOfWeek;
          const isToday   = date === today;
          const scheduled = getScheduled(date);
          const workout   = scheduled ? WORKOUTS.find(w => w.id === scheduled.workoutId) : null;
          const isOpen    = openDay === date;
          const justSaved = savedDay === date;

          return (
            <div key={date}>
              {showWeekHeader && (
                <div style={{
                  fontSize: 'var(--text-sm)', fontWeight: 800,
                  color: 'var(--terracotta)', marginBottom: 4,
                  paddingRight: 4, marginTop: weekNum > 1 ? 8 : 0,
                }}>
                  שבוע {weekNum}
                </div>
              )}
              {/* Day card */}
              <div style={{
                background: isToday ? 'linear-gradient(135deg, #FFFDF9, #FAF0E6)' : 'var(--card-bg)',
                border: isToday
                  ? '2px solid var(--terracotta-light)'
                  : '1.5px solid var(--light)',
                borderRadius: 20,
                padding: '18px 20px',
                boxShadow: isToday ? 'var(--shadow-warm)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}>
                {/* Top row: date info + action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Date badge */}
                  <div style={{
                    background: isToday ? 'var(--terracotta)' : 'var(--light-bg)',
                    color: isToday ? 'white' : 'var(--mid)',
                    borderRadius: 12,
                    padding: '8px 12px',
                    textAlign: 'center',
                    minWidth: 56,
                    flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                      {formatDisplayDate(date)}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, marginTop: 2 }}>
                      {getDayName(date)}
                    </div>
                  </div>

                  {/* Workout info */}
                  <div style={{ flex: 1 }}>
                    {workout ? (
                      <>
                        <div style={{ fontSize: 'var(--text-sm)', color: workout.colors.accent, fontWeight: 700, marginBottom: 2 }}>
                          {workout.category}
                        </div>
                        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--dark)', lineHeight: 1.2 }}>
                          {workout.title}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--mid)', marginTop: 2 }}>
                          {workout.durationMinutes} דקות
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 'var(--text-base)', color: 'var(--mid)' }}>
                        {isToday ? '← שבצי אימון להיום' : 'ללא אימון'}
                      </div>
                    )}
                  </div>

                  {/* Action button */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {justSaved ? (
                      <span style={{
                        background: 'var(--sage)', color: 'white',
                        borderRadius: 100, padding: '8px 14px',
                        fontSize: 'var(--text-sm)', fontWeight: 700,
                      }}>✓ נשמר</span>
                    ) : (
                      <button
                        onClick={() => { setOpenDay(isOpen ? null : date); setStructureOpen(null); }}
                        style={{
                          background: isOpen ? 'var(--terracotta)' : workout ? 'var(--light-bg)' : 'var(--terracotta)',
                          color: isOpen ? 'white' : workout ? 'var(--dark-mid)' : 'white',
                          border: 'none', borderRadius: 100,
                          padding: '8px 16px', cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)', fontWeight: 700,
                          minHeight: 40,
                        }}
                        aria-expanded={isOpen}
                      >
                        {workout ? 'שנה' : 'בחרי'}
                      </button>
                    )}
                    {workout && !isOpen && !justSaved && (
                      <button
                        onClick={() => handleClear(date)}
                        style={{
                          background: 'transparent', border: 'none',
                          color: 'var(--mid)', fontSize: 'var(--text-xs)',
                          cursor: 'pointer', fontFamily: 'var(--font-body)',
                          padding: '2px 4px', minHeight: 28,
                        }}
                        aria-label="הסר אימון"
                      >
                        הסר
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Workout picker (inline, expands below card) */}
              {isOpen && (
                <div style={{
                  background: 'white',
                  border: '1.5px solid var(--terracotta-light)',
                  borderTop: 'none',
                  borderRadius: '0 0 20px 20px',
                  padding: '4px 12px 12px',
                  marginTop: -8,
                  animation: 'screenIn 0.2s ease',
                }}>
                  <p style={{
                    fontSize: 'var(--text-sm)', color: 'var(--mid)',
                    padding: '10px 8px 8px', fontWeight: 600,
                  }}>
                    בחרי אימון ל{getDayName(date)}:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {WORKOUTS.map(w => {
                      const isChosen = scheduled?.workoutId === w.id;
                      const isStructureExpanded = structureOpen === w.id;
                      return (
                        <div key={w.id} style={{
                          background: isChosen ? w.colors.bg : 'var(--light-bg)',
                          border: isChosen
                            ? `2px solid ${w.colors.accent}`
                            : '1.5px solid var(--light)',
                          borderRadius: 14,
                          overflow: 'hidden',
                          transition: 'border-color 0.15s ease',
                        }}>
                          {/* Workout row */}
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 14px',
                          }}>
                            <div style={{
                              width: 10, height: 10, borderRadius: '50%',
                              background: w.colors.accent, flexShrink: 0,
                            }} />
                            {/* Clickable title area → picks workout */}
                            <button
                              onClick={() => handlePick(date, w.id)}
                              style={{
                                flex: 1, background: 'none', border: 'none',
                                cursor: 'pointer', textAlign: 'right',
                                fontFamily: 'var(--font-body)', padding: 0,
                              }}
                            >
                              <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--dark)' }}>
                                {w.title}
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--mid)', marginTop: 2 }}>
                                {w.durationMinutes} דקות · {w.category}
                              </div>
                            </button>
                            {/* Structure toggle button */}
                            <button
                              onClick={(e) => toggleStructure(w.id, e)}
                              aria-expanded={isStructureExpanded}
                              style={{
                                background: isStructureExpanded ? w.colors.accent : w.colors.light,
                                color: isStructureExpanded ? 'white' : w.colors.accent,
                                border: 'none', borderRadius: 8,
                                padding: '5px 9px',
                                fontSize: 11, fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'var(--font-body)',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {isStructureExpanded ? 'סגור ▲' : 'מבנה ▾'}
                            </button>
                            {isChosen && (
                              <span style={{ color: w.colors.accent, fontWeight: 700, fontSize: 18, flexShrink: 0 }}>✓</span>
                            )}
                          </div>

                          {/* Workout structure panel */}
                          {isStructureExpanded && (
                            <div style={{
                              padding: '0 12px 12px',
                              borderTop: `1px solid ${w.colors.light}`,
                            }}>
                              <WorkoutStructurePanel workoutId={w.id} accent={w.colors.accent} />
                              {/* Pick button at the bottom of the structure */}
                              <button
                                onClick={() => handlePick(date, w.id)}
                                style={{
                                  width: '100%', marginTop: 10,
                                  background: w.colors.accent, color: 'white',
                                  border: 'none', borderRadius: 10,
                                  padding: '10px 0', cursor: 'pointer',
                                  fontFamily: 'var(--font-body)',
                                  fontSize: 'var(--text-sm)', fontWeight: 700,
                                  minHeight: 42,
                                }}
                              >
                                בחרי אימון זה ל{getDayName(date)}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => { setOpenDay(null); setStructureOpen(null); }}
                    style={{
                      width: '100%', marginTop: 8, padding: '10px',
                      background: 'transparent', border: 'none',
                      color: 'var(--mid)', fontSize: 'var(--text-sm)',
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                      minHeight: 40,
                    }}
                  >
                    סגור
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
