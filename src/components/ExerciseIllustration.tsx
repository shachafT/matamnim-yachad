import { VisualType } from '../data/workoutsData';

interface Props {
  type: VisualType;
  color: string;
  side?: 'right' | 'left';
}

export default function ExerciseIllustration({ type, color, side = 'right' }: Props) {
  const c = color;

  const styles: Record<string, React.CSSProperties> = {
    wrap: {
      width: 180, height: 180, display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative', margin: '0 auto',
    },
  };

  switch (type) {
    case 'breathing':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes breathe { 0%,100%{transform:scale(.65);opacity:.5} 50%{transform:scale(1);opacity:.9} }
            @keyframes breathe2 { 0%,100%{transform:scale(.75);opacity:.3} 50%{transform:scale(1.1);opacity:.6} }
          `}</style>
          <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', background:c, opacity:.08,
            animation:'breathe2 4s ease-in-out infinite' }} />
          <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', background:c, opacity:.18,
            animation:'breathe 4s ease-in-out infinite' }} />
          <div style={{ position:'absolute', width:72, height:72, borderRadius:'50%', background:c, opacity:.6,
            animation:'breathe 4s ease-in-out infinite 0.2s', boxShadow:`0 0 24px ${c}60` }} />
          <span style={{ fontSize:28, position:'relative', zIndex:1 }}>🌬️</span>
        </div>
      );

    case 'shoulders':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes spinCW { from{transform:rotate(0)} to{transform:rotate(360deg)} }
            @keyframes spinCCW { from{transform:rotate(0)} to{transform:rotate(-360deg)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Body */}
            <ellipse cx="90" cy="100" rx="22" ry="38" fill={c} opacity="0.25" />
            <circle cx="90" cy="50" r="18" fill={c} opacity="0.3" />
            {/* Left shoulder arc */}
            <g style={{ transformOrigin:'55px 80px', animation:'spinCCW 2.5s linear infinite' }}>
              <path d="M55,80 A28,28 0 0,0 27,80" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8"/>
              <polygon points="27,72 27,88 16,80" fill={c} opacity="0.8" />
            </g>
            {/* Right shoulder arc */}
            <g style={{ transformOrigin:'125px 80px', animation:'spinCW 2.5s linear infinite' }}>
              <path d="M125,80 A28,28 0 0,1 153,80" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8"/>
              <polygon points="153,72 153,88 164,80" fill={c} opacity="0.8" />
            </g>
          </svg>
        </div>
      );

    case 'arms-open':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes armsOpen { 0%,100%{transform:scaleX(.4)} 50%{transform:scaleX(1)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="48" r="18" fill={c} opacity="0.4" />
            <rect x="78" y="68" width="24" height="48" rx="10" fill={c} opacity="0.3" />
            <g style={{ transformOrigin:'90px 90px', animation:'armsOpen 2s ease-in-out infinite' }}>
              <rect x="20" y="80" width="58" height="14" rx="7" fill={c} opacity="0.7" />
              <rect x="102" y="80" width="58" height="14" rx="7" fill={c} opacity="0.7" />
            </g>
            <circle cx="30" cy="87" r="8" fill={c} opacity="0.5" />
            <circle cx="150" cy="87" r="8" fill={c} opacity="0.5" />
          </svg>
        </div>
      );

    case 'knees-alt': {
      const leftUp = side === 'right';
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes kneeL { 0%,45%,100%{transform:translateY(0)} 50%,95%{transform:translateY(-28px)} }
            @keyframes kneeR { 0%,45%,100%{transform:translateY(-28px)} 50%,95%{transform:translateY(0)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="38" r="18" fill={c} opacity="0.35" />
            <rect x="78" y="58" width="24" height="40" rx="10" fill={c} opacity="0.25" />
            {/* Chair seat */}
            <rect x="55" y="105" width="70" height="10" rx="4" fill={c} opacity="0.3" />
            {/* Left leg */}
            <g style={{ transformOrigin:'75px 105px', animation:'kneeL 1.6s ease-in-out infinite' }}>
              <rect x="67" y="98" width="16" height="36" rx="8" fill={c} opacity="0.6" />
            </g>
            {/* Right leg */}
            <g style={{ transformOrigin:'105px 105px', animation:'kneeR 1.6s ease-in-out infinite' }}>
              <rect x="97" y="98" width="16" height="36" rx="8" fill={c} opacity="0.8" />
            </g>
          </svg>
        </div>
      );
    }

    case 'leg-ext':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes legOut { 0%,100%{transform:rotate(90deg)} 50%{transform:rotate(0deg)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="70" cy="60" r="16" fill={c} opacity="0.35" />
            <rect x="60" y="78" width="20" height="36" rx="8" fill={c} opacity="0.25" />
            <rect x="42" y="118" width="56" height="10" rx="4" fill={c} opacity="0.25" />
            <g style={{ transformOrigin:'70px 118px', animation:'legOut 2s ease-in-out infinite' }}>
              <rect x="62" y="108" width="16" height="52" rx="8" fill={c} opacity="0.7" />
            </g>
            {/* Arrow */}
            <text x="108" y="148" fill={c} fontSize="24" opacity="0.8">→</text>
          </svg>
        </div>
      );

    case 'ankle':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes ankleCircle { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <ellipse cx="90" cy="100" rx="30" ry="18" fill={c} opacity="0.2" />
            <rect x="78" y="50" width="24" height="55" rx="8" fill={c} opacity="0.25" />
            <ellipse cx="90" cy="110" rx="22" ry="14" fill={c} opacity="0.4" />
            <g style={{ transformOrigin:'90px 110px', animation:'ankleCircle 2s linear infinite' }}>
              <path d="M90,96 A14,14 0 0,1 104,110" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9"/>
              <polygon points="104,103 104,117 112,110" fill={c} opacity="0.9" />
            </g>
          </svg>
        </div>
      );

    case 'march':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes footL { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
            @keyframes footR { 0%,50%{transform:translateY(-22px)} 50%,100%{transform:translateY(0)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="40" r="16" fill={c} opacity="0.3" />
            <rect x="78" y="58" width="24" height="46" rx="10" fill={c} opacity="0.2" />
            {/* Left foot */}
            <g style={{ animation:'footL 1s ease-in-out infinite' }}>
              <rect x="64" y="105" width="18" height="38" rx="9" fill={c} opacity="0.7" />
              <ellipse cx="73" cy="143" rx="14" ry="7" fill={c} opacity="0.6" />
            </g>
            {/* Right foot */}
            <g style={{ animation:'footR 1s ease-in-out infinite' }}>
              <rect x="98" y="105" width="18" height="38" rx="9" fill={c} opacity="0.8" />
              <ellipse cx="107" cy="143" rx="14" ry="7" fill={c} opacity="0.7" />
            </g>
          </svg>
        </div>
      );

    case 'walk-lateral':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes walkLR { 0%,100%{transform:translateX(-30px)} 50%{transform:translateX(30px)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <rect x="20" y="150" width="140" height="6" rx="3" fill={c} opacity="0.2" />
            {/* Arrows */}
            <text x="12" y="100" fill={c} fontSize="28" opacity="0.6">←</text>
            <text x="140" y="100" fill={c} fontSize="28" opacity="0.6">→</text>
            <g style={{ animation:'walkLR 2s ease-in-out infinite' }}>
              <circle cx="90" cy="60" r="14" fill={c} opacity="0.5" />
              <rect x="80" y="76" width="20" height="38" rx="8" fill={c} opacity="0.4" />
              <rect x="76" y="114" width="14" height="30" rx="7" fill={c} opacity="0.6" />
              <rect x="90" y="114" width="14" height="30" rx="7" fill={c} opacity="0.5" />
            </g>
          </svg>
        </div>
      );

    case 'chair-stand':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes standUp { 0%,40%{transform:translateY(0) scaleY(1)} 60%,100%{transform:translateY(-28px) scaleY(1.15)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Chair */}
            <rect x="50" y="118" width="80" height="10" rx="4" fill={c} opacity="0.2" />
            <rect x="50" y="128" width="10" height="30" rx="4" fill={c} opacity="0.15" />
            <rect x="120" y="128" width="10" height="30" rx="4" fill={c} opacity="0.15" />
            {/* Person rising */}
            <g style={{ animation:'standUp 2.2s ease-in-out infinite', transformOrigin:'90px 118px' }}>
              <circle cx="90" cy="68" r="16" fill={c} opacity="0.4" />
              <rect x="78" y="86" width="24" height="38" rx="10" fill={c} opacity="0.3" />
              <rect x="70" y="124" width="18" height="30" rx="8" fill={c} opacity="0.5" />
              <rect x="92" y="124" width="18" height="30" rx="8" fill={c} opacity="0.5" />
            </g>
            {/* Arrow up */}
            <text x="136" y="88" fill={c} fontSize="26" opacity="0.7">↑</text>
          </svg>
        </div>
      );

    case 'heel-raise':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes heelUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <rect x="40" y="155" width="100" height="6" rx="3" fill={c} opacity="0.25" />
            <g style={{ animation:'heelUp 1.5s ease-in-out infinite' }}>
              {/* Two feet */}
              <ellipse cx="75" cy="148" rx="20" ry="10" fill={c} opacity="0.6" />
              <ellipse cx="105" cy="148" rx="20" ry="10" fill={c} opacity="0.6" />
              <rect x="62" y="105" width="26" height="44" rx="10" fill={c} opacity="0.4" />
              <rect x="92" y="105" width="26" height="44" rx="10" fill={c} opacity="0.4" />
            </g>
            {/* Legs */}
            <rect x="68" y="60" width="22" height="50" rx="9" fill={c} opacity="0.2" />
            <rect x="90" y="60" width="22" height="50" rx="9" fill={c} opacity="0.2" />
            <text x="136" y="130" fill={c} fontSize="22" opacity="0.7">↑↓</text>
          </svg>
        </div>
      );

    case 'wall-push':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes pushWall { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-16px)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Wall */}
            <rect x="140" y="30" width="16" height="140" rx="4" fill={c} opacity="0.3" />
            {/* Person pushing */}
            <g style={{ animation:'pushWall 1.8s ease-in-out infinite' }}>
              <circle cx="72" cy="55" r="16" fill={c} opacity="0.4" />
              <rect x="62" y="73" width="20" height="42" rx="9" fill={c} opacity="0.3" />
              {/* Arms */}
              <rect x="82" y="82" width="50" height="12" rx="6" fill={c} opacity="0.6" />
              <circle cx="130" cy="88" r="8" fill={c} opacity="0.5" />
              <rect x="58" y="115" width="14" height="36" rx="7" fill={c} opacity="0.4" />
              <rect x="74" y="115" width="14" height="36" rx="7" fill={c} opacity="0.4" />
            </g>
          </svg>
        </div>
      );

    case 'weight-shift':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes shift { 0%,100%{transform:translateX(-12px) rotate(-5deg)} 50%{transform:translateX(12px) rotate(5deg)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <rect x="30" y="155" width="120" height="6" rx="3" fill={c} opacity="0.2" />
            <g style={{ animation:'shift 2s ease-in-out infinite', transformOrigin:'90px 90px' }}>
              <circle cx="90" cy="46" r="16" fill={c} opacity="0.4" />
              <rect x="78" y="64" width="24" height="46" rx="10" fill={c} opacity="0.3" />
              <rect x="64" y="110" width="22" height="42" rx="10" fill={c} opacity="0.55" />
              <rect x="94" y="110" width="22" height="42" rx="10" fill={c} opacity="0.55" />
            </g>
          </svg>
        </div>
      );

    case 'water-bottle':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes curlUp { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-80deg)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="80" cy="52" r="16" fill={c} opacity="0.35" />
            <rect x="68" y="70" width="24" height="50" rx="10" fill={c} opacity="0.2" />
            {/* Arm with bottle */}
            <g style={{ transformOrigin:'80px 120px', animation:'curlUp 1.8s ease-in-out infinite' }}>
              <rect x="72" y="112" width="16" height="42" rx="8" fill={c} opacity="0.55" />
              {/* Bottle */}
              <rect x="65" y="148" width="22" height="34" rx="6" fill={c} opacity="0.4" />
              <rect x="69" y="142" width="14" height="10" rx="4" fill={c} opacity="0.35" />
            </g>
          </svg>
        </div>
      );

    case 'toe-tap':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes toeTap { 0%,100%{transform:translateY(0)} 50%{transform:translateY(18px)} }
          `}</style>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <ellipse cx="70" cy="110" rx="40" ry="8" fill={c} opacity={0.12}/>
            <line x1="70" y1="30" x2="70" y2="90" stroke={c} strokeWidth="6" strokeLinecap="round"/>
            <circle cx="70" cy="22" r="14" fill={c} opacity={0.5}/>
            <line x1="50" y1="60" x2="35" y2="80" stroke={c} strokeWidth="4" strokeLinecap="round"/>
            <line x1="90" y1="60" x2="105" y2="80" stroke={c} strokeWidth="4" strokeLinecap="round"/>
            <g style={{ animation:'toeTap 1.6s ease-in-out infinite' }}>
              <line x1="70" y1="90" x2="100" y2="118" stroke={c} strokeWidth="5" strokeLinecap="round"/>
              <circle cx="104" cy="122" r="7" fill={c} opacity={0.7}/>
            </g>
            <line x1="70" y1="90" x2="40" y2="110" stroke={c} strokeWidth="5" strokeLinecap="round"/>
            <circle cx="36" cy="114" r="7" fill={c} opacity={0.3}/>
          </svg>
        </div>
      );

    case 'tandem':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes tandemPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Wall */}
            <rect x="148" y="20" width="12" height="150" rx="4" fill={c} opacity="0.2"/>
            {/* Floor line */}
            <line x1="30" y1="150" x2="145" y2="150" stroke={c} strokeWidth="2" opacity="0.2"/>
            {/* Foot heel (back) */}
            <ellipse cx="80" cy="148" rx="14" ry="6" fill={c} opacity="0.35"/>
            {/* Foot toe (front) touching heel – tandem */}
            <ellipse cx="100" cy="148" rx="14" ry="6" fill={c} opacity="0.65"
              style={{ animation:'tandemPulse 2.2s ease-in-out infinite' }}/>
            {/* Legs */}
            <rect x="74" y="110" width="14" height="40" rx="7" fill={c} opacity="0.35"/>
            <rect x="90" y="110" width="14" height="40" rx="7" fill={c} opacity="0.55"/>
            {/* Torso */}
            <ellipse cx="90" cy="90" rx="16" ry="22" fill={c} opacity="0.2"/>
            {/* Arm reaching to wall */}
            <line x1="106" y1="82" x2="142" y2="90" stroke={c} strokeWidth="6" strokeLinecap="round" opacity="0.55"/>
            <circle cx="142" cy="90" r="6" fill={c} opacity="0.4"/>
            {/* Head */}
            <circle cx="90" cy="50" r="16" fill={c} opacity="0.4"/>
            {/* Neck */}
            <rect x="86" y="65" width="8" height="10" rx="3" fill={c} opacity="0.25"/>
          </svg>
        </div>
      );

    case 'trunk-rotation':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes rotate { 0%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} 100%{transform:rotate(-15deg)} }
          `}</style>
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ transformOrigin:'70px 80px', animation:'rotate 3s ease-in-out infinite' }}>
            <ellipse cx="70" cy="50" rx="20" ry="28" fill={c} opacity={0.25}/>
            <circle cx="70" cy="22" r="14" fill={c} opacity={0.5}/>
            <line x1="70" y1="78" x2="70" y2="110" stroke={c} strokeWidth="5" strokeLinecap="round"/>
            <line x1="40" y1="58" x2="25" y2="75" stroke={c} strokeWidth="4" strokeLinecap="round"/>
            <line x1="100" y1="58" x2="115" y2="75" stroke={c} strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>
      );

    case 'neck-tilt':
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes neckTilt { 0%,100%{transform:rotate(-14deg)} 50%{transform:rotate(14deg)} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Body (static) */}
            <ellipse cx="90" cy="115" rx="22" ry="30" fill={c} opacity="0.2"/>
            {/* Arms resting */}
            <rect x="40" y="100" width="36" height="10" rx="5" fill={c} opacity="0.2"/>
            <rect x="104" y="100" width="36" height="10" rx="5" fill={c} opacity="0.2"/>
            {/* Neck */}
            <rect x="84" y="75" width="12" height="14" rx="4" fill={c} opacity="0.3"/>
            {/* Head tilting */}
            <g style={{ transformOrigin:'90px 82px', animation:'neckTilt 3s ease-in-out infinite' }}>
              <circle cx="90" cy="58" r="20" fill={c} opacity="0.45"/>
              {/* Eyes */}
              <circle cx="83" cy="55" r="3" fill={c} opacity="0.6"/>
              <circle cx="97" cy="55" r="3" fill={c} opacity="0.6"/>
              {/* Mouth – smile */}
              <path d="M83,65 Q90,72 97,65" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5"/>
            </g>
            {/* Side arrows indicating tilt */}
            <text x="18" y="68" fill={c} fontSize="22" opacity="0.35">←</text>
            <text x="138" y="68" fill={c} fontSize="22" opacity="0.35">→</text>
          </svg>
        </div>
      );

    case 'calm':
    default:
      return (
        <div style={styles.wrap}>
          <style>{`
            @keyframes calmBreathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06)} }
            @keyframes calmGlow   { 0%,100%{opacity:.12}         50%{opacity:.28} }
          `}</style>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Glow aura */}
            <circle cx="90" cy="90" r="75" fill={c} opacity="0.08"
              style={{ animation:'calmGlow 4s ease-in-out infinite' }}/>
            {/* Chair */}
            <rect x="52" y="118" width="76" height="8" rx="4" fill={c} opacity="0.18"/>
            <rect x="52" y="126" width="8" height="28" rx="4" fill={c} opacity="0.12"/>
            <rect x="120" y="126" width="8" height="28" rx="4" fill={c} opacity="0.12"/>
            {/* Body breathing */}
            <g style={{ transformOrigin:'90px 110px', animation:'calmBreathe 4s ease-in-out infinite' }}>
              <ellipse cx="90" cy="106" rx="20" ry="24" fill={c} opacity="0.22"/>
              {/* Arms resting on lap */}
              <rect x="44" y="108" width="34" height="9" rx="5" fill={c} opacity="0.25"/>
              <rect x="102" y="108" width="34" height="9" rx="5" fill={c} opacity="0.25"/>
            </g>
            {/* Neck */}
            <rect x="85" y="72" width="10" height="14" rx="4" fill={c} opacity="0.25"/>
            {/* Head */}
            <circle cx="90" cy="56" r="18" fill={c} opacity="0.38"/>
            {/* Closed eyes – relaxed */}
            <path d="M82,54 Q85,58 88,54" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
            <path d="M92,54 Q95,58 98,54" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
            {/* Gentle smile */}
            <path d="M83,63 Q90,69 97,63" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45"/>
          </svg>
        </div>
      );
  }
}
