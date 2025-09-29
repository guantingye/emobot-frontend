// AvatarAnimation.jsx - 穩定播放版（單例播放器 + 競態防護 + SVG修正）
import React, { useEffect, useRef, useState } from "react";

/** ====== 單例音訊控制器（避免多 audio 元件互搶） ====== */
const AudioController = (() => {
  let audio = null;       // HTMLAudioElement
  let playingToken = 0;   // 用來確保只播放最新的音檔

  function ensure() {
    if (!audio) {
      audio = new Audio();
      audio.preload = "auto";
    }
    return audio;
  }

  /** 播放 base64 dataURL；只允許最新 token 播放，舊的會被停掉 */
  async function play(dataUrl) {
    const a = ensure();
    const myToken = ++playingToken;

    try {
      // 停掉舊播放
      a.pause();
      a.currentTime = 0;

      // 設定新來源
      a.src = dataUrl;
      // iOS/Safari 容易卡住，顯式 load
      a.load();

      // 嘗試播放；若在期間有新的 token 產生，直接中止
      const playPromise = a.play();
      if (playPromise && typeof playPromise.then === "function") {
        await playPromise;
      }

      // 僅當我仍是最新 token 時才監聽 ended
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
      // 常見：AbortError（被 pause 中斷），直接忽略
      if (err && err.name === "AbortError") return;
      // 其它錯誤丟上層讓 UI 顯示
      throw err;
    }
  }

  function stop() {
    const a = ensure();
    playingToken++; // 讓任何等待中的播放失效
    a.pause();
  }

  function isSpeaking() {
    const a = ensure();
    return !a.paused;
  }

  function currentTime() {
    const a = ensure();
    return a.currentTime || 0;
  }

  return { play, stop, isSpeaking, currentTime };
})();

/** ====== Avatar 渲染：SVG 不再使用 height="auto" ====== */
function Face({ mouth = 0, blink = "open", head = { x: 0, y: 0 } }) {
  // 將嘴型 0~1 映射到下巴位移
  const jaw = 4 + mouth * 10; // px
  const isClosed = blink === "closed";

  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"                 // ✅ 不用 auto
      height="100%"                // ✅ 不用 auto
      preserveAspectRatio="xMidYMid meet"
      style={{
        maxWidth: 220,
        maxHeight: 220,
        display: "block",
      }}
    >
      <g transform={`translate(${head.x}, ${head.y})`}>
        {/* 臉底 */}
        <circle cx="100" cy="100" r="90" fill="#F5F7FB" stroke="#DDE3EE" />
        {/* 眼睛 */}
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
        {/* 嘴巴 */}
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

/** ====== 將後端 animation_data 播放成逐幀屬性 ====== */
function useAnimationPlayer(animationData) {
  const [frame, setFrame] = useState({ mouth: 0, blink: "open", head: { x: 0, y: 0 } });
  const rafRef = useRef(null);
  const startRef = useRef(null);

  // 預處理時間軸（避免每次 render 做線性搜尋）
  const mouth = animationData?.mouth_animation || [];
  const blinks = animationData?.blink_animation || [];
  const heads = animationData?.head_animation || [];
  const total = animationData?.total_duration || 3;

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();

    const loop = () => {
      const t = (performance.now() - startRef.current) / 1000; // 秒
      const clamped = Math.min(t, total);

      // 找 mouth 最接近 clamped 的一個幀
      let m = 0;
      if (mouth.length > 0) {
        const idx = Math.max(
          0,
          mouth.findIndex((f) => f.time >= clamped) - 1
        );
        const f = mouth[Math.min(Math.max(idx, 0), mouth.length - 1)];
        m = f?.mouth_openness ?? 0;
      }

      // blink
      let b = "open";
      for (let i = 0; i < blinks.length; i++) {
        const f = blinks[i];
        if (Math.abs(f.time - clamped) < 0.06) {
          b = f.eye_state;
          break;
        }
      }

      // head
      let h = { x: 0, y: 0 };
      if (heads.length > 0) {
        const idx = Math.max(
          0,
          heads.findIndex((f) => f.time >= clamped) - 1
        );
        const f = heads[Math.min(Math.max(idx, 0), heads.length - 1)];
        h = { x: (f?.head_x || 0) * 6, y: (f?.head_y || 0) * 6 };
      }

      setFrame({ mouth: m, blink: b, head: h });

      if (t < total && AudioController.isSpeaking()) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    // 啟動
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationData?.metadata?.generated_at]); // 新一段動畫才重跑

  return frame;
}

/** ====== 封裝呼叫 /api/chat/avatar/animate 並安全播放 ====== */
async function fetchAnimation({ apiBase, text, botType }) {
  const res = await fetch(`${apiBase}/api/chat/avatar/animate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, bot_type: botType }),
  });
  const data = await res.json();
  if (!data?.success && !data?.audio_base64) {
    const err = data?.error || "無法產生語音/動畫";
    throw new Error(err);
  }
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
    // 空訊息不觸發
    if (!text || !text.trim()) return;

    let cancelled = false;
    const myReqId = ++lastReqIdRef.current;

    // 避免同時送出多個請求：上一個還在播就先停
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
            // 吸收 AbortError；其它錯誤丟給 UI
            if (!e || e.name !== "AbortError") {
              throw e;
            }
          } finally {
            setPlaying(false);
          }
        } else {
          // 沒聲音：讓動畫跑一段時間即可
          setPlaying(false);
        }
      } catch (e) {
        const msg = e?.message || "播放失敗";
        setError(msg);
        if (onError) onError(msg);
        setPlaying(false);
      }
    })();

    return () => {
      cancelled = true;
      // 中止本次播放（會讓舊 play 的 promise 走 AbortError，已處理）
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
