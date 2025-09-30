// AvatarAnimation.jsx - 長方形容器填滿 + 內外雙層強烈呼吸光暈 + 靜音切換；支援分段 TTS
import React, { useEffect, useRef, useState } from "react";

/** ====== 安全取得 API Base ====== */
function getApiBase(propApiBase) {
  if (propApiBase && typeof propApiBase === "string") return propApiBase;

  if (typeof window !== "undefined" && typeof window.API_BASE === "string" && window.API_BASE) {
    return window.API_BASE.replace(/\/+$/, "");
  }
  try {
    const v = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || "";
    if (v) return v.replace(/\/+$/, "");
  } catch (_) {}
  if (typeof process !== "undefined" && process.env && typeof process.env.API_BASE === "string" && process.env.API_BASE) {
    return process.env.API_BASE.replace(/\/+$/, "");
  }
  return "https://emobot-backend.onrender.com";
}

/** ====== 單例音訊控制器（避免多 audio 互搶；支援分段播放；支援靜音） ====== */
const AudioController = (() => {
  let audio = null;
  let playingToken = 0;
  let muted = false;

  function ensure() {
    if (!audio) {
      audio = new Audio();
      audio.preload = "auto";
      audio.muted = muted;
      audio.volume = muted ? 0 : 1;
    }
    return audio;
  }
  function setMuted(m) {
    muted = !!m;
    const a = ensure();
    a.muted = muted;
    a.volume = muted ? 0 : 1;
  }
  function getMuted() {
    return muted;
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
  async function playQueue(segments = []) {
    for (let i = 0; i < segments.length; i++) {
      await play(segments[i]);
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
  return { play, playQueue, stop, isSpeaking, setMuted, getMuted };
})();

/** ====== 呼叫後端 ====== */
async function fetchAnimation({ apiBase, text, botType }) {
  const res = await fetch(`${apiBase}/api/chat/avatar/animate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, bot_type: botType }),
  });
  if (!res.ok) {
    const textErr = await res.text().catch(() => "");
    throw new Error(`Animate API ${res.status}: ${textErr}`);
  }
  return res.json();
}

/** ====== SVG Icons ====== */
const IconVolume = ({ muted }) => (
  muted ? (
    // volume-off
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 9v6h4l5 4V5L7 9H3z" fill="#fff" opacity=".9"/>
      <path d="M16 9l5 5m0-5l-5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ) : (
    // volume-on
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 9v6h4l5 4V5L7 9H3z" fill="#fff" opacity=".9"/>
      <path d="M16 7a5 5 0 010 10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18.5 5a8 8 0 010 14" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".85"/>
    </svg>
  )
);

/** ====== 主元件 ====== */
export default function AvatarAnimation({
  apiBase,
  text,
  botType = "solution",
  avatarImageUrl,        // 使用者在會員專區選的頭像圖
  onError,
}) {
  const resolvedApiBase = getApiBase(apiBase);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState("pending");
  const [muted, setMuted] = useState(AudioController.getMuted());
  const lastReqIdRef = useRef(0);

  // 切換靜音
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    AudioController.setMuted(next);
  };

  useEffect(() => {
    if (!text || !text.trim()) return;

    let cancelled = false;
    const myReqId = ++lastReqIdRef.current;
    AudioController.stop();

    (async () => {
      try {
        setError(null);
        setPlaying(false);
        setProvider("pending");

        const data = await fetchAnimation({ apiBase: resolvedApiBase, text, botType });
        if (cancelled || myReqId !== lastReqIdRef.current) return;

        const p = data?.animation_data?.meta?.provider || "openai";
        setProvider(p);

        if (data.audio_segments?.length) {
          setPlaying(true);
          try {
            await AudioController.playQueue(data.audio_segments);
          } catch (e) {
            if (!e || e.name !== "AbortError") throw e;
          } finally {
            setPlaying(false);
          }
        } else if (data.audio_base64) {
          setPlaying(true);
          try {
            await AudioController.play(data.audio_base64);
          } catch (e) {
            if (!e || e.name !== "AbortError") throw e;
          } finally {
            setPlaying(false);
          }
        } else {
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
  }, [text, botType, resolvedApiBase]);

  /* ====== 視覺：框架（Frame）縮小 + 內外雙層光暈 ======
     - 父層仍滿版，但實際顯示的圖片框(Frame)往內縮 10px，留出可視空間給光暈
     - OuterHalo：在 Frame 外緣（inset: 2px）強烈呼吸擴散
     - EdgeHalo：緊貼 Frame 邊緣的內圈呼吸
     - 兩層都只在 playing 時顯示（靜音時也顯示，方便辨識正在說話）
  */
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        // 父層維持溢出裁切，光暈以「縮小 Frame」換取視覺空間，不需要超出舞台
        overflow: "hidden",
      }}
    >
      {/* 外框（不裁切），只負責放內縮的 Frame 與光暈 */}
      {/* OuterHalo：圖片外緣的大面積光圈（強烈、擴散） */}
      <div
        style={{
          position: "absolute",
          // 內縮 2px，距離舞台邊 2px；讓它在 Frame 四周可見
          top: 2, right: 2, bottom: 2, left: 2,
          borderRadius: 24,
          pointerEvents: "none",
          zIndex: 1,
          opacity: playing ? 1 : 0,
          transition: "opacity .2s ease-out",
          animation: playing ? "emobotOuterPulse 1.15s ease-in-out infinite" : "none",
        }}
      />

      {/* EdgeHalo：緊貼圖片外緣的內圈高亮（更銳利） */}
      <div
        style={{
          position: "absolute",
          // 和 Frame 一樣縮 10px，剛好落在圖片外緣
          top: 10, right: 10, bottom: 10, left: 10,
          borderRadius: 20,
          pointerEvents: "none",
          zIndex: 2,
          opacity: playing ? 1 : 0,
          transition: "opacity .2s ease-out",
          animation: playing ? "emobotEdgePulse 0.9s ease-in-out infinite" : "none",
        }}
      />

      {/* 內縮的圖片框（真正裁切 + 陰影） */}
      <div
        style={{
          position: "absolute",
          top: 10, right: 10, bottom: 10, left: 10, // 內縮 10px，留出光暈可視空間
          borderRadius: 20,
          overflow: "hidden",
          background: "#fff",
          zIndex: 3,
          boxShadow: "0 12px 40px rgba(0,0,0,.15)",
        }}
      >
        <img
          src={avatarImageUrl}
          alt="avatar"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* 右上角：靜音切換（置於最上層） */}
      <button
        onClick={toggleMute}
        aria-label={muted ? "取消靜音" : "靜音"}
        title={muted ? "取消靜音" : "靜音"}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 38,
          height: 38,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.7)",
          background: muted
            ? "linear-gradient(135deg, rgba(30,30,30,.92), rgba(60,60,60,.92))"
            : "linear-gradient(135deg, rgba(90,140,242,.95), rgba(122,194,221,.95))",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          boxShadow: "0 8px 18px rgba(0,0,0,.28)",
          backdropFilter: "blur(6px)",
          zIndex: 5,
        }}
      >
        <IconVolume muted={muted} />
      </button>

      {/* 右下角狀態徽章（可移除） */}
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 12,
          padding: "6px 10px",
          borderRadius: 12,
          fontSize: 12,
          color: "#334",
          background: "rgba(255,255,255,.88)",
          boxShadow: "0 2px 8px rgba(0,0,0,.12)",
          zIndex: 5,
        }}
      >
        狀態：{playing ? (muted ? "說話中 (靜音)" : "說話中...") : "待機"}　來源：{provider}
        {error && <span style={{ color: "#c00", marginLeft: 8 }}>錯誤：{error}</span>}
      </div>

      {/* 光暈動畫定義：外圈更柔和擴散、內圈更銳利脈衝 */}
      <style>{`
        /* 外圈：大面積擴散，帶模糊層疊與色彩層次 */
        @keyframes emobotOuterPulse {
          0% {
            box-shadow:
              0 0 0 0 rgba(90,140,242,0.46),
              0 0 22px 8px rgba(90,140,242,0.35),
              0 0 62px 24px rgba(90,140,242,0.18),
              inset 0 0 0 0 rgba(122,194,221,0.18);
            transform: scale(0.995);
            filter: blur(0.2px);
          }
          50% {
            box-shadow:
              0 0 0 0 rgba(90,140,242,0.62),
              0 0 36px 14px rgba(90,140,242,0.45),
              0 0 120px 44px rgba(90,140,242,0.26),
              inset 0 0 0 2px rgba(122,194,221,0.22);
            transform: scale(1.01);
            filter: blur(0.6px);
          }
          100% {
            box-shadow:
              0 0 0 0 rgba(90,140,242,0.46),
              0 0 22px 8px rgba(90,140,242,0.35),
              0 0 62px 24px rgba(90,140,242,0.18),
              inset 0 0 0 0 rgba(122,194,221,0.18);
            transform: scale(0.995);
            filter: blur(0.2px);
          }
        }

        /* 內圈：靠近圖片邊緣的銳利脈衝，帶「描邊發光」感 */
        @keyframes emobotEdgePulse {
          0% {
            box-shadow:
              0 0 0 0 rgba(122,194,221,0.0),
              0 0 0 0 rgba(90,140,242,0.0),
              inset 0 0 0 0 rgba(90,140,242,0.0);
            transform: scale(1);
          }
          50% {
            box-shadow:
              0 0 10px 2px rgba(122,194,221,0.28),
              0 0 28px 9px rgba(90,140,242,0.32),
              inset 0 0 0 2px rgba(90,140,242,0.28);
            transform: scale(1.005);
          }
          100% {
            box-shadow:
              0 0 0 0 rgba(122,194,221,0.0),
              0 0 0 0 rgba(90,140,242,0.0),
              inset 0 0 0 0 rgba(90,140,242,0.0);
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
