// AvatarAnimation.jsx - TTS-only 版（停用 demo 影片 fallback）
// - 單例音訊播放器避免 AbortError
// - 沒有 audio 也不播 demo，只顯示動畫（靜默或之後有聲都 ok）
// - 修正 <svg height="auto"> 警告，改為 width/height="100%" + viewBox

import React, { useEffect, useRef, useState } from "react";

/** ====== 單例音訊控制器（避免多 audio 互搶） ====== */
const AudioController = (() => {
  let audio = null;
  let playingToken = 0;

  function ensure() {
    if (!audio) {
      audio = new Audio();
      audio.preload = "auto";
    }
    return audio;
  }
  async function play(dataUrl) {
    const a = ensure();
    const myToken = ++playingToken;
    try {
      a.pause();
      a.currentTime = 0;
      a.src = dataUrl;
      a.load();
      const p = a.play();
      if (p && typeof p.then === "function") await p;
      if (myToken === playingToken) {
        await new Promise((resolve) => {
          const onEnd = () => {
            a.removeEventListener("ended", onEnd);
            resolve();
          };
          a.addEventListener("ended", onEnd, { once: true });
        });
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      throw err;
    }
  }
  function stop() {
    const a = ensure();
    playingToken++;
    a.pause();
  }
  function isSpeaking() {
    const a = ensure();
    return !a.paused;
  }
  return { play, stop, isSpeaking };
})();

/** ====== Avatar SVG（不使用 height="auto"） ====== */
function Face({ mouth = 0, blink = "open", head = { x: 0, y: 0 } }) {
  const jaw = 4 + mouth * 10;
  const isClosed = blink === "closed";
  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: 220, maxHeight: 220, display: "block" }}
    >
      <g transform={`translate(${head.x}, ${head.y})`}>
        <circle cx="100" cy="100" r="90" fill="#F5F7FB" stroke="#DDE3EE" />
        <g>
          {isClosed ? (
            <>
              <line x1="70" y1="85" x2="90" y2="85" stroke="#333" strokeWidth="3" />
              <line x1="110" y1="85" x2="130" y2="85" stroke="#333" strokeWidth="3" />
            </>
          ) : (
            <>
              <circle cx="80" cy="85" r="6" fill="#333" />
              <circle cx="120" cy="85" r="6" fill="#333" />
            </>
          )}
        </g>
        <path
          d={`M 70 ${120 + mouth * 2} Q 100 ${120 + jaw} 130 ${120 + mouth * 2}`}
          stroke="#333"
          strokeWidth="4"
          fill="transparent"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** ====== 將 animation_data 播成逐幀 ====== */
function useAnimationPlayer(animationData) {
  const [frame, setFrame] = useState({ mouth: 0, blink: "open", head: { x: 0, y: 0 } });
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const mouth = animationData?.mouth_animation || [];
  const blinks = animationData?.blink_animation || [];
  const heads = animationData?.head_animation || [];
  const total = animationData?.total_duration || 3;

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();

    const loop = () => {
      const t = (performance.now() - startRef.current) / 1000;
      const clamped = Math.min(t, total);

      let m = 0;
      if (mouth.length > 0) {
        let idx = mouth.findIndex((f) => f.time >= clamped);
        if (idx === -1) idx = mouth.length - 1;
        idx = Math.max(0, idx - 1);
        m = mouth[idx]?.mouth_openness ?? 0;
      }

      let b = "open";
      for (let i = 0; i < blinks.length; i++) {
        const f = blinks[i];
        if (Math.abs(f.time - clamped) < 0.06) {
          b = f.eye_state;
          break;
        }
      }

      let h = { x: 0, y: 0 };
      if (heads.length > 0) {
        let idx = heads.findIndex((f) => f.time >= clamped);
        if (idx === -1) idx = heads.length - 1;
        idx = Math.max(0, idx - 1);
        const f = heads[idx];
        h = { x: (f?.head_x || 0) * 6, y: (f?.head_y || 0) * 6 };
      }

      setFrame({ mouth: m, blink: b, head: h });

      // 只要還在說話就繼續跑；若是靜默模式也讓它跑到 total 即停
      if (t < total && (AudioController.isSpeaking() || t < total)) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // 以 generated_at 作為「新一次動畫」的依賴
  }, [animationData?.metadata?.generated_at]);

  return frame;
}

/** ====== 呼叫後端 ====== */
async function fetchAnimation({ apiBase, text, botType }) {
  const res = await fetch(`${apiBase}/api/chat/avatar/animate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, bot_type: botType }),
  });
  const data = await res.json();
  // ✅ 關掉 demo：即使沒有 audio_base64 也視為可播放（以純動畫呈現）
  return data;
}

/** ====== 主元件 ====== */
export default function AvatarAnimation({
  apiBase = import.meta.env.VITE_API_BASE || "https://emobot-backend.onrender.com",
  text,
  botType = "solution",
  onError,
}) {
  const [anim, setAnim] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const lastReqIdRef = useRef(0);

  const frame = useAnimationPlayer(anim);

  useEffect(() => {
    if (!text || !text.trim()) return;

    let cancelled = false;
    const myReqId = ++lastReqIdRef.current;

    // 每次開始新一句前，先停掉舊的
    AudioController.stop();

    (async () => {
      try {
        setError(null);
        setPlaying(false);

        const data = await fetchAnimation({ apiBase, text, botType });
        if (cancelled || myReqId !== lastReqIdRef.current) return;

        setAnim(data.animation_data || null);

        if (data.audio_base64) {
          setPlaying(true);
          try {
            await AudioController.play(data.audio_base64);
          } catch (e) {
            if (!e || e.name !== "AbortError") throw e;
          } finally {
            setPlaying(false);
          }
        } else {
          // ❌ 不播 demo；純動畫照跑即可
          setPlaying(false);
        }
      } catch (e) {
        const msg = e?.message || "播放失敗";
        setError(msg);
        onError?.(msg);
        setPlaying(false);
      }
    })();

    return () => {
      cancelled = true;
      AudioController.stop();
    };
  }, [text, botType, apiBase]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: 16,
          background: "#fff",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Face mouth={frame.mouth} blink={frame.blink} head={frame.head} />
      </div>

      <div style={{ fontSize: 14, color: "#334" }}>
        <div>狀態：{playing ? "說話中..." : "待機"}</div>
        {error && <div style={{ color: "#c00" }}>錯誤：{error}</div>}
        <div style={{ opacity: 0.7 }}>
          來源：{anim?.meta?.provider || "pending"}
        </div>
      </div>
    </div>
  );
}
