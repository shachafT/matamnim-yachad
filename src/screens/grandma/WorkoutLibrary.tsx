import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WORKOUTS } from '../../data/workoutsData';
import { resolveWorkoutVariant } from '../../engine/adaptationEngine';

const LEVEL_EMOJI: Record<string, string> = {
  'מתחילים': '🌱',
  'מתחילים–בינוניים': '🌿',
  'בינוניים': '🌳',
};

const RISK_COLOR: Record<string, string> = {
  'נמוך':   '#5C8B60',
  'בינוני': '#C4744A',
  'גבוה':   '#C0392B',
};

export default function WorkoutLibrary() {
  const { state, navigate, setSelectedWorkout } = useApp();
  const { difficulties } = state.grandmaProfile;

  // Pre-resolve adaptations for each workout
  const resolutions = useMemo(
    () => Object.fromEntries(WORKOUTS.map(w => [w.id, resolveWorkoutVariant(w.id, difficulties)])),
    [difficulties]
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', paddingBottom:40 }}>

      {/* ── Header ── */}
      <div style={{
        padding:'40px 24px 24px',
        background:'linear-gradient(170deg, #FFFCF7 0%, #FAF0E6 100%)',
        borderBottom:'1.5px solid var(--light)',
      }}>
        <button className="back-btn" onClick={() => navigate('grandma-home')} style={{ marginBottom:16 }}>›</button>
        <h1 style={{ fontSize:'var(--text-3xl)', marginBottom:6 }}>בחרי אימון</h1>
        <p style={{ color:'var(--mid)', fontSize:'var(--text-lg)' }}>
          6 אימונים עדינים, בטוחים ופשוטים
        </p>

        {/* Active difficulties summary */}
        {difficulties.length > 0 && (
          <div style={{
            marginTop:14, padding:'12px 14px',
            background:'rgba(255,255,255,0.7)', borderRadius:14,
            border:'1.5px solid var(--terracotta-light)',
            fontSize:'var(--text-sm)', color:'var(--dark-mid)',
          }}>
            <strong>🎯 האימונים הותאמו לפרופיל שלך</strong>
            <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', gap:6 }}>
              {difficulties.slice(0, 5).map(d => (
                <span key={d} style={{
                  background:'var(--terracotta-light)', color:'var(--terracotta-dark)',
                  borderRadius:100, padding:'2px 10px', fontSize:'var(--text-xs)', fontWeight:600,
                }}>
                  {resolutions[WORKOUTS[0].id]?.activeAdaptations.find(() => true)?.emoji ?? '•'} {d}
                </span>
              ))}
              {difficulties.length > 5 && (
                <span style={{ fontSize:'var(--text-xs)', color:'var(--mid)', padding:'2px 0' }}>
                  +{difficulties.length - 5} נוספות
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Cards ── */}
      <div style={{ padding:'24px 20px', display:'flex', flexDirection:'column', gap:16 }}>
        {WORKOUTS.map((w, i) => {
          const res = resolutions[w.id];
          const hasAdaptation = res.activeAdaptations.length > 0;
          const riskBadgeColor = RISK_COLOR[res.maxRiskLevel] ?? '#5C8B60';
          const displayDuration = res.adjustedDuration > 0 ? res.adjustedDuration : w.durationMinutes;

          return (
            <div key={w.id} style={{
              background: w.colors.bg,
              borderRadius:24,
              border:`2px solid ${res.maxRiskLevel === 'גבוה' ? '#F5C5A8' : w.colors.light}`,
              padding:'22px 20px',
              boxShadow:'0 4px 20px rgba(44,36,32,0.07)',
              animation:`screenIn 0.35s ease ${i * 0.06}s both`,
              position:'relative',
            }}>

              {/* Category + level row */}
              <div style={{ marginBottom:10, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{
                  background: w.colors.accent, color:'white', borderRadius:100,
                  padding:'3px 14px', fontSize:'var(--text-xs)', fontWeight:700,
                }}>
                  {w.category}
                </span>
                <span style={{ marginRight:'auto', marginLeft:0, fontSize:'var(--text-sm)', color:w.colors.accent, fontWeight:600 }}>
                  {LEVEL_EMOJI[w.level] || '🌿'} {w.level}
                </span>
                {/* Adaptation badge */}
                {hasAdaptation && (
                  <span style={{
                    background:`${riskBadgeColor}18`, color:riskBadgeColor,
                    border:`1px solid ${riskBadgeColor}40`,
                    borderRadius:100, padding:'3px 10px',
                    fontSize:'var(--text-xs)', fontWeight:700,
                  }}>
                    ✦ מותאם אישית
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily:'var(--font-display)', fontSize:'var(--text-2xl)',
                color:w.colors.text, marginBottom:8, lineHeight:1.2,
              }}>
                {w.title}
              </h2>

              {/* Goal */}
              <p style={{ fontSize:'var(--text-base)', color:'var(--dark-mid)', lineHeight:1.6, marginBottom:14 }}>
                {w.goal}
              </p>

              {/* Meta row */}
              <div style={{ display:'flex', gap:16, marginBottom:hasAdaptation ? 12 : 18, flexWrap:'wrap' }}>
                <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:'var(--text-base)', color:w.colors.accent, fontWeight:700 }}>
                  ⏱️ {displayDuration} דקות
                  {res.adjustedDuration > 0 && res.adjustedDuration !== w.durationMinutes && (
                    <span style={{ fontSize:'var(--text-xs)', textDecoration:'line-through', color:'var(--mid)', fontWeight:400 }}>
                      {w.durationMinutes}
                    </span>
                  )}
                </span>
                <span style={{ fontSize:'var(--text-base)', color:'var(--mid)' }}>
                  {w.equipment}
                </span>
              </div>

              {/* Active adaptations chips */}
              {hasAdaptation && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                  {res.forceSeated && (
                    <span style={{ background:'#E8F3E8', color:'#4A7A4E', borderRadius:100, padding:'3px 10px', fontSize:'var(--text-xs)', fontWeight:600 }}>
                      גרסת כיסא
                    </span>
                  )}
                  {res.paceMultiplier > 1 && (
                    <span style={{ background:'#E8F4FB', color:'#3A7A9C', borderRadius:100, padding:'3px 10px', fontSize:'var(--text-xs)', fontWeight:600 }}>
                      קצב איטי
                    </span>
                  )}
                  {res.maxSteps && (
                    <span style={{ background:'#FFF0E8', color:'#C4744A', borderRadius:100, padding:'3px 10px', fontSize:'var(--text-xs)', fontWeight:600 }}>
                      {res.maxSteps} תרגילים
                    </span>
                  )}
                  {res.simplifyInstructions && (
                    <span style={{ background:'#F2EEF8', color:'#7B6EAC', borderRadius:100, padding:'3px 10px', fontSize:'var(--text-xs)', fontWeight:600 }}>
                      הוראות פשוטות
                    </span>
                  )}
                  {(res.uiLargeIllustration || res.uiHighContrast) && (
                    <span style={{ background:'#FBF5E8', color:'#A07020', borderRadius:100, padding:'3px 10px', fontSize:'var(--text-xs)', fontWeight:600 }}>
                      תצוגה מוגדלת
                    </span>
                  )}
                </div>
              )}

              {/* CTA */}
              <button
                className="btn"
                onClick={() => { setSelectedWorkout(w.id); navigate('grandma-active-workout'); }}
                style={{
                  background: w.colors.accent, color:'white', borderRadius:100,
                  minHeight:60, fontSize:'var(--text-xl)', fontWeight:700,
                  boxShadow:`0 4px 20px ${w.colors.accent}40`, width:'100%',
                }}
              >
                התחילי אימון
              </button>
            </div>
          );
        })}
      </div>

      {/* Safety footer */}
      <div style={{ margin:'0 20px 20px', padding:'16px 20px', background:'#FFF8E8', borderRadius:16, border:'1.5px solid #F5D898' }}>
        <p style={{ fontSize:'var(--text-sm)', color:'#7A5800', lineHeight:1.6 }}>
          <strong>הערה:</strong> אם יש כאב חד, סחרחורת או קושי חריג – עוצרים. האפליקציה אינה תחליף לייעוץ רפואי.
        </p>
      </div>
    </div>
  );
}
