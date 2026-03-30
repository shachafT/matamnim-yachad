import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getStepsForWorkout, WORKOUTS } from '../../data/workoutsData';
import ExerciseIllustration from '../../components/ExerciseIllustration';
import {
  resolveWorkoutVariant, applyPace, applyReps, applyMaxSteps, getStepInstruction,
} from '../../engine/adaptationEngine';

const ENCOURAGEMENTS = ['מצוין! 🌟', 'יופי! ❤️', 'עוד קצת 💪', 'נשמי בנחת 🌸', 'כל הכבוד! ✨', 'מדהים! 🎉'];

type SupportMode = 'רגיל' | 'כיסא' | 'קיר';

export default function ActiveWorkout() {
  const { state, navigate, addWorkout } = useApp();
  const workout  = WORKOUTS.find(w => w.id === state.selectedWorkoutId) ?? WORKOUTS[0];
  const allSteps = getStepsForWorkout(workout.id);

  const res = useMemo(
    () => resolveWorkoutVariant(workout.id, state.grandmaProfile.difficulties),
    [workout.id, state.grandmaProfile.difficulties]
  );

  const steps = useMemo(() => applyMaxSteps(allSteps, res), [allSteps, res]);

  const [stepIdx,       setStepIdx]       = useState(0);
  const [timeLeft,      setTimeLeft]      = useState(0);
  const [repsDone,      setRepsDone]      = useState(0);
  const [supportMode,   setSupportMode]   = useState<SupportMode>(res.defaultSupportMode);
  const [encouragement, setEncouragement] = useState('');
  const [startTime]  = useState(Date.now());

  const step       = steps[stepIdx];
  const isLastStep = stepIdx === steps.length - 1;

  const adaptedDuration = useMemo(
    () => step ? applyPace(step.durationSeconds, res) : 0,
    [step, res]
  );
  const adaptedReps = useMemo(
    () => step ? applyReps(step.reps, res) : 0,
    [step, res]
  );

  const { accent, bg, light, text } = workout.colors;

  const fillPercent = step?.isReps
    ? Math.min((repsDone / Math.max(adaptedReps, 1)) * 100, 100)
    : adaptedDuration > 0
      ? Math.min(((adaptedDuration - timeLeft) / adaptedDuration) * 100, 100)
      : 0;

  const overallProgress = (stepIdx / steps.length) * 100;
  const isLast3 = !step?.isReps && timeLeft > 0 && timeLeft <= 3;

  // ── Reset on step change ───────────────────────────────────────────────────
  useEffect(() => {
    if (!step) return;
    setTimeLeft(adaptedDuration);
    setRepsDone(0);
    setEncouragement('');
    setSupportMode(res.defaultSupportMode);
  }, [stepIdx, adaptedDuration, res.defaultSupportMode]);

  // ── Countdown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!step || step.isReps || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setEncouragement(ENCOURAGEMENTS[stepIdx % ENCOURAGEMENTS.length]);
          if (res.autoAdvance) {
            setTimeout(() => advance(), 1200);
          }
          return 0;
        }
        if (prev === Math.ceil(adaptedDuration / 2)) {
          setEncouragement(ENCOURAGEMENTS[(stepIdx + 2) % ENCOURAGEMENTS.length]);
          setTimeout(() => setEncouragement(''), 1800);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeLeft, step, stepIdx, adaptedDuration, res.autoAdvance]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    if (stepIdx < steps.length - 1) {
      setStepIdx(s => s + 1);
    } else {
      const elapsed = Math.round((Date.now() - startTime) / 60000);
      addWorkout({
        date: new Date().toISOString().split('T')[0],
        duration: elapsed || workout.durationMinutes,
        exerciseCount: steps.length,
        type: workout.category,
      });
      navigate('grandma-workout-summary');
    }
  }, [stepIdx, steps.length]);

  const goBack = () => {
    if (stepIdx > 0) setStepIdx(s => s - 1);
    else navigate('grandma-home');
  };

  const addRep = () => {
    const next = repsDone + 1;
    setRepsDone(next);
    if (next >= adaptedReps) {
      setEncouragement(ENCOURAGEMENTS[stepIdx % ENCOURAGEMENTS.length]);
      setTimeout(() => advance(), 1200);
    }
  };

  // ── Support toggle: chair / wall availability per step ────────────────────
  const hasSeparateChair = step?.chairVersion && step.chairVersion !== 'לא רלוונטי' && step.chairVersion !== step.screenInstruction;
  const hasSeparateWall  = step?.wallVersion  && step.wallVersion  !== 'לא רלוונטי' && step.wallVersion  !== step.screenInstruction;

  const availableModes: SupportMode[] = res.forceSeated
    ? ['כיסא']
    : [
        'רגיל',
        ...(hasSeparateChair ? ['כיסא' as SupportMode] : []),
        ...(hasSeparateWall  ? ['קיר'  as SupportMode] : []),
      ];

  const showToggle = availableModes.length > 1;

  if (!step) return null;

  // ── Instruction text ───────────────────────────────────────────────────────
  const instructionText = getStepInstruction(step, supportMode, res.simplifyInstructions);

  // ── Layout sizing driven by accessibility ──────────────────────────────────
  const bigText = res.uiLargeIllustration;

  return (
    <div style={{ minHeight:'100vh', background: bg, position:'relative', overflow:'hidden', direction:'rtl' }}>

      {/* ── Background progress fill (right → left) ── */}
      <div style={{
        position:'fixed', top:0, right:0,
        width:`${fillPercent}%`, height:'100%',
        background:`linear-gradient(to left, ${light}55, ${accent}14)`,
        transition:'width 1s linear',
        pointerEvents:'none', zIndex:0,
      }} />

      {/* ── Top overall progress bar ── */}
      <div style={{ position:'fixed', top:0, right:0, left:0, height:8, background:`${light}80`, zIndex:10 }}>
        <div style={{
          height:'100%', width:`${overallProgress}%`,
          background:`linear-gradient(to left, ${accent}, ${light})`,
          transition:'width 0.5s ease',
        }} />
      </div>

      {/* ── Adaptation banners ── */}
      {(res.showConservativeModeLabel || res.maxRiskLevel === 'גבוה') && (
        <div style={{
          position:'fixed', top:8, right:0, left:0, zIndex:20,
          background:'rgba(255,248,220,0.97)', borderBottom:'1.5px solid #F5D898',
          padding:'6px 16px', textAlign:'center',
          fontSize:'var(--text-sm)', color:'#7A5800', fontWeight:600,
        }}>
          {res.showConservativeModeLabel ? '🛡️ מצב שמרני – האימון הותאם במיוחד לפרופיל שלך' : '⚠️ האימון הותאם לפי הפרופיל שלך – גרסה בטוחה'}
        </div>
      )}

      {/* ── Breathing reminder (blood_pressure) ── */}
      {res.showBreathingReminder && (
        <div style={{
          position:'fixed', top: (res.showConservativeModeLabel || res.maxRiskLevel === 'גבוה') ? 42 : 8,
          right:0, left:0, zIndex:19,
          background:'rgba(234,245,251,0.97)', borderBottom:'1.5px solid #B8E0F5',
          padding:'4px 16px', textAlign:'center',
          fontSize:'var(--text-xs)', color:'#1A4A60', fontWeight:600,
        }}>
          🫁 זכרי לנשוף במאמץ – לא לעצור נשימה
        </div>
      )}

      {/* ── Hand on wall reminder (balance) ── */}
      {res.showHandOnWallReminder && (
        <div style={{
          position:'fixed', bottom: res.showBigStopButton ? 90 : 0, right:0, left:0, zIndex:19,
          background:'rgba(242,238,248,0.97)', borderTop:'1.5px solid #D4C8F0',
          padding:'8px 16px', textAlign:'center',
          fontSize:'var(--text-sm)', color:'#2A1A60', fontWeight:700,
        }}>
          🤚 יד על קיר או כיסא – תמיד
        </div>
      )}

      {/* ── Meal timing reminder (diabetes) ── */}
      {res.showTimingReminder && stepIdx === 0 && (
        <div style={{
          position:'absolute', bottom:0, right:0, left:0, zIndex:18,
          background:'rgba(234,245,235,0.97)', borderTop:'1.5px solid #B8E8C8',
          padding:'8px 16px', textAlign:'center',
          fontSize:'var(--text-xs)', color:'#1A4020',
        }}>
          🍽️ מומלץ להתאמן לאחר ארוחה קלה
        </div>
      )}

      <div style={{
        position:'relative', zIndex:1, padding:'20px 20px 0',
        paddingTop: (res.showConservativeModeLabel || res.maxRiskLevel === 'גבוה')
          ? (res.showBreathingReminder ? 74 : 44)
          : (res.showBreathingReminder ? 40 : 20),
      }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:12, marginBottom:14 }}>
          <button
            onClick={() => navigate('grandma-home')}
            style={{
              background:'rgba(255,255,255,0.7)', border:`1.5px solid ${light}`,
              borderRadius:100, width: res.showBigStopButton ? 56 : 48, height: res.showBigStopButton ? 56 : 48,
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', fontSize: res.showBigStopButton ? 24 : 20, flexShrink:0,
              fontWeight:700, color: res.showBigStopButton ? '#C0392B' : 'inherit',
            }}
            aria-label="עצירה"
          >✕</button>

          <div style={{ flex:1 }}>
            <div style={{ fontSize:'var(--text-sm)', color:accent, fontWeight:700 }}>
              {workout.title}
            </div>
            <div style={{ fontSize:'var(--text-sm)', color:'var(--mid)' }}>
              {res.forceSeated ? '🪑 ' : ''}{res.simplifyInstructions ? '🧠 ' : ''}
              תרגיל {stepIdx + 1} מתוך {steps.length}
            </div>
          </div>

          {/* Support toggle */}
          {showToggle && !res.forceSeated && (
            <div style={{ display:'flex', gap:4 }}>
              {availableModes.map(m => (
                <button key={m} onClick={() => setSupportMode(m)} style={{
                  padding:'6px 10px', borderRadius:100,
                  border:`1.5px solid ${light}`,
                  background: supportMode === m ? accent : 'rgba(255,255,255,0.7)',
                  color: supportMode === m ? 'white' : text,
                  fontSize:'var(--text-xs)', fontWeight:700, cursor:'pointer',
                }} aria-pressed={supportMode === m}>{m}</button>
              ))}
            </div>
          )}
          {res.forceSeated && (
            <span style={{
              background:`${accent}20`, color:accent,
              borderRadius:100, padding:'4px 12px',
              fontSize:'var(--text-xs)', fontWeight:700,
            }}>🪑 כיסא</span>
          )}
        </div>

        {/* ── Exercise name ── */}
        <h1 style={{
          fontFamily:'var(--font-display)',
          fontSize: bigText ? 'var(--text-2xl)' : 'var(--text-3xl)',
          color:text, textAlign:'center', marginBottom:16, lineHeight:1.2,
          animation:'screenIn 0.35s ease',
        }}>
          {step.title}
        </h1>

        {/* ── Illustration ── */}
        <div style={{ textAlign:'center', marginBottom:14, animation:'screenIn 0.4s ease' }}>
          <ExerciseIllustration type={step.visualType} color={accent} />
        </div>

        {/* ── Instruction ── */}
        <div style={{
          background:'rgba(255,255,255,0.78)', backdropFilter:'blur(8px)',
          borderRadius:20, padding:'18px 22px', textAlign:'center',
          marginBottom:12, border:`1.5px solid ${light}`,
          ...(res.uiHighContrast ? { background:'white', border:`2px solid ${accent}` } : {}),
        }}>
          <p style={{
            fontSize: bigText ? 'var(--text-2xl)' : 'var(--text-xl)',
            fontWeight:700, color:text, lineHeight:1.4,
          }}>
            {instructionText}
          </p>
          {step.perSide && (
            <p style={{ fontSize:'var(--text-base)', color:accent, marginTop:6, fontWeight:600 }}>
              לכל צד בנפרד
            </p>
          )}
          {/* Per-step safety note */}
          {step.safetyNote && (
            <p style={{ fontSize:'var(--text-xs)', color:'#7A5800', marginTop:8, fontWeight:600 }}>
              ⚠️ {step.safetyNote}
            </p>
          )}
          {res.uiSubtitlesRequired && (
            <p style={{ fontSize:'var(--text-sm)', color:'var(--mid)', marginTop:4, borderTop:`1px solid ${light}`, paddingTop:6 }}>
              [{step.screenInstruction}]
            </p>
          )}
        </div>

        {/* ── Timer / Reps ── */}
        {step.isReps ? (
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <div style={{
              display:'inline-flex', flexDirection:'column', alignItems:'center',
              background:'rgba(255,255,255,0.75)', borderRadius:100, padding:'18px 36px',
              border:`2px solid ${light}`,
            }}>
              <span style={{ fontSize:60, fontWeight:900, color:accent, lineHeight:1, fontFamily:'var(--font-display)' }}>
                {repsDone}
              </span>
              <span style={{ fontSize:'var(--text-lg)', color:'var(--mid)' }}>
                מתוך {adaptedReps} חזרות
                {res.reduceRepsByPct > 0 && (
                  <span style={{ fontSize:'var(--text-xs)', color:accent, marginRight:6 }}>(מותאם)</span>
                )}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <svg width="110" height="110">
                <circle cx="55" cy="55" r="46" fill="none" stroke={`${light}`} strokeWidth="8" />
                <circle cx="55" cy="55" r="46" fill="none"
                  stroke={accent} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - fillPercent / 100)}`}
                  style={{ transition:'stroke-dashoffset 1s linear', transformOrigin:'55px 55px', transform:'rotate(-90deg) scaleX(-1)' }}
                />
              </svg>
              <div style={{
                position:'absolute', top:'50%', left:'50%',
                transform:'translate(-50%,-50%)', textAlign:'center',
                animation: isLast3 ? 'pulse 0.5s ease-in-out infinite' : 'none',
              }}>
                <span style={{ fontSize:36, fontWeight:900, color:accent, display:'block', fontFamily:'var(--font-display)', lineHeight:1 }}>
                  {timeLeft}
                </span>
                <span style={{ fontSize:'var(--text-xs)', color:'var(--mid)' }}>שניות</span>
              </div>
            </div>
            {res.paceMultiplier > 1 && (
              <div style={{ fontSize:'var(--text-xs)', color:accent, marginTop:4 }}>
                🐢 קצב מותאם
              </div>
            )}
          </div>
        )}

        {/* ── Encouragement / emotional boost ── */}
        {(encouragement || (res.showEmotionalBoost && stepIdx === 0)) && (
          <div style={{ textAlign:'center', marginBottom:10, animation:'screenIn 0.3s ease' }}>
            <span style={{ fontSize:'var(--text-xl)', fontWeight:800, color:accent, fontFamily:'var(--font-display)' }}>
              {encouragement || 'את מדהימה! 💛'}
            </span>
          </div>
        )}

        {/* ── Controls ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, paddingBottom:24 }}>
          {step.isReps && (
            <button className="btn" onClick={addRep} style={{
              background:accent, color:'white', minHeight: res.showBigStopButton ? 80 : 70,
              fontSize:'var(--text-xl)', fontWeight:700, borderRadius:22,
              boxShadow:`0 6px 28px ${accent}40`,
            }}>
              ✓ ביצעתי חזרה
            </button>
          )}

          <div style={{ display:'flex', gap:10 }}>
            <button onClick={goBack} style={{
              flex:1, minHeight:58, background:'rgba(255,255,255,0.7)',
              border:`2px solid ${light}`, borderRadius:18,
              fontSize:'var(--text-lg)', cursor:'pointer',
              fontFamily:'var(--font-body)', fontWeight:700, color:text,
            }} aria-label="תרגיל קודם">‹ הקודם</button>

            <button onClick={advance} style={{
              flex:2, minHeight:58,
              background: isLastStep ? 'var(--sage)' : accent,
              color:'white', border:'none', borderRadius:18,
              fontSize:'var(--text-xl)', cursor:'pointer',
              fontFamily:'var(--font-body)', fontWeight:700,
              boxShadow:`0 4px 20px ${accent}40`,
            }} aria-label={isLastStep ? 'סיום אימון' : 'תרגיל הבא'}>
              {isLastStep ? '✅ סיום!' : 'הבא ›'}
            </button>
          </div>

          <button onClick={() => navigate('grandma-home')} style={{
            background:'transparent', border:'none', cursor:'pointer',
            color:'var(--mid)', fontSize:'var(--text-base)',
            fontFamily:'var(--font-body)', padding:'8px', minHeight:44,
          }}>עצירה</button>
        </div>

        {/* ── Stop signs (prominent when applicable) ── */}
        {res.stopSigns.length > 0 && (
          <div style={{
            background:'rgba(255,240,232,0.9)', borderRadius:14,
            padding:'12px 16px', marginBottom:12,
            border:'1.5px solid #F5C5A8',
            fontSize:'var(--text-sm)', color:'#7A2800', lineHeight:1.7,
          }}>
            <div style={{ fontWeight:700, marginBottom:4 }}>🛑 עצרי אם יש:</div>
            {res.stopSigns.map((s, i) => <div key={i}>• {s}</div>)}
          </div>
        )}

        {/* ── Safety alerts ── */}
        {res.safetyAlerts.length > 0 && (
          <div style={{
            background:'rgba(255,248,225,0.9)', borderRadius:14,
            padding:'12px 16px', marginBottom:12,
            border:'1px solid #F5D898',
            fontSize:'var(--text-sm)', color:'#7A5800', lineHeight:1.5,
          }}>
            {res.safetyAlerts.map((a, i) => <div key={i}>⚠️ {a}</div>)}
          </div>
        )}

        {/* ── Adaptation variant hints ("if hard, do this") ── */}
        {res.variantNotes.length > 0 && (
          <div style={{
            background:'rgba(234,245,251,0.92)', borderRadius:14,
            padding:'12px 16px', marginBottom:12,
            border:'1px solid #B8E0F5',
            fontSize:'var(--text-sm)', color:'#1A4A60', lineHeight:1.6,
          }}>
            <div style={{ fontWeight:700, marginBottom:4 }}>💡 אם קשה לך:</div>
            {res.variantNotes.map((note, i) => (
              <div key={i} style={{ marginBottom: i < res.variantNotes.length - 1 ? 6 : 0 }}>
                • {note}
              </div>
            ))}
          </div>
        )}

        {/* ── Fallback workout safety ── */}
        <div style={{
          background:'rgba(255,248,225,0.85)', borderRadius:14,
          padding:'10px 14px', marginBottom:20,
          fontSize:'var(--text-xs)', color:'#7A5800',
        }}>
          ⚠️ {workout.safetyText}
        </div>
      </div>
    </div>
  );
}
