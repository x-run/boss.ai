import { useEffect, useRef, useState } from "react";

/* ── Dummy editor data ── */
interface Editor {
  id: number;
  name: string;
  avatar: string;
  experience: string;
  rating: number;
  skills: string[];
}

const EDITORS: Editor[] = [
  {
    id: 1,
    name: "田中 悠斗",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    experience: "7 years",
    rating: 4.9,
    skills: ["YouTube", "Color Grading", "Motion Graphics"],
  },
  {
    id: 2,
    name: "佐藤 美咲",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    experience: "5 years",
    rating: 4.8,
    skills: ["TikTok", "Reels", "Ads"],
  },
  {
    id: 3,
    name: "高橋 蓮",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    experience: "10 years",
    rating: 5.0,
    skills: ["YouTube", "Documentary", "Color Grading"],
  },
  {
    id: 4,
    name: "鈴木 結月",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    experience: "4 years",
    rating: 4.7,
    skills: ["Reels", "Ads", "SNS"],
  },
  {
    id: 5,
    name: "伊藤 翔太",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    experience: "8 years",
    rating: 4.9,
    skills: ["YouTube", "Vlog", "Sound Design"],
  },
  {
    id: 6,
    name: "渡辺 さくら",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    experience: "6 years",
    rating: 4.8,
    skills: ["TikTok", "Motion Graphics", "Ads"],
  },
  {
    id: 7,
    name: "中村 大翔",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    experience: "3 years",
    rating: 4.6,
    skills: ["YouTube", "Reels", "Thumbnail"],
  },
  {
    id: 8,
    name: "小林 凛",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    experience: "9 years",
    rating: 5.0,
    skills: ["Color Grading", "Documentary", "Ads"],
  },
];

const CARD_WIDTH = 300;
const CARD_GAP = 20;
const SPEED = 0.5; // px per frame

export default function WorkerCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const [, forceRender] = useState(0);

  /* total width of one set */
  const setWidth = EDITORS.length * (CARD_WIDTH + CARD_GAP);

  useEffect(() => {
    /* kick a single re-render so the track paints doubled content */
    forceRender(1);

    const tick = () => {
      if (!pausedRef.current) {
        posRef.current -= SPEED;
        if (Math.abs(posRef.current) >= setWidth) {
          posRef.current += setWidth;
        }
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [setWidth]);

  const doubled = [...EDITORS, ...EDITORS];

  return (
    <section className="py-28 sm:py-40 px-6 md:px-10 relative">
      <div className="max-w-[1280px] mx-auto mb-16">
        <p className="mono-label mb-5" style={{ color: "var(--accent-dim)" }}>
          Editors
        </p>
        <h2 className="section-header">
          厳選された
          <span style={{ color: "var(--text-muted)" }}>クリエイター。</span>
        </h2>
      </div>

      {/* Carousel viewport */}
      <div
        className="carousel-viewport"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div
          ref={trackRef}
          className="carousel-track"
          style={{ gap: `${CARD_GAP}px` }}
        >
          {doubled.map((editor, i) => (
            <div
              key={`${editor.id}-${i}`}
              className="editor-card"
              style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH }}
            >
              {/* Avatar + name row */}
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={editor.avatar}
                  alt={editor.name}
                  className="editor-avatar"
                  loading="lazy"
                />
                <div>
                  <p className="editor-name">{editor.name}</p>
                  <p className="editor-exp">{editor.experience}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="editor-rating mb-4">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="var(--accent)">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{editor.rating.toFixed(1)}</span>
              </div>

              {/* Skills */}
              <div className="editor-skills">
                {editor.skills.map((skill) => (
                  <span key={skill} className="editor-skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Gradient masks */}
        <div className="carousel-fade carousel-fade--left" aria-hidden="true" />
        <div className="carousel-fade carousel-fade--right" aria-hidden="true" />
      </div>
    </section>
  );
}
