// src/api/client.js
// 增強版本 - 支援專業 AI persona 和同理心回應

const API_BASE = "https://emobot-backend.onrender.com"; // ★ 請替換成你的實際後端 URL

console.log("Enhanced API_BASE:", API_BASE);

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 格式化錯誤訊息
function formatError(data, status) {
  if (!data) return `HTTP ${status}`;
  if (Array.isArray(data.detail)) {
    const messages = data.detail.map(err => {
      const field = Array.isArray(err.loc) ? err.loc.join('.') : 'field';
      return `${field}: ${err.msg}`;
    });
    return `驗證錯誤: ${messages.join(', ')}`;
  }
  if (typeof data.detail === "string") return data.detail;
  if (data.message) return data.message;
  if (data.error) return data.error;
  return `HTTP ${status}`;
}

// ★ 增強的 request 函數
async function request(path, options = {}) {
  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}${path}`;

  let { method = "GET", headers = {}, body, retries = 2 } = options;

  // 準備請求體
  if (body != null && typeof body !== "string") {
    body = JSON.stringify(body);
  }
  const httpMethod = method.toUpperCase();
  if (!body && ["POST", "PUT", "PATCH"].includes(httpMethod)) {
    body = "{}";
  }

  // 準備標頭
  const finalHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...authHeader(),
    ...headers,
  };

  console.log(`🌐 ${httpMethod} ${url}`);
  if (body && body !== "{}") {
    console.log("📤 Request body:", body.substring(0, 100) + (body.length > 100 ? "..." : ""));
  }

  // ★ 重試邏輯
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, { 
        method: httpMethod, 
        headers: finalHeaders, 
        body,
        mode: 'cors',
        credentials: 'include',
      });

      console.log(`📥 Response (attempt ${attempt}): ${resp.status} ${resp.statusText}`);

      let data;
      const contentType = resp.headers.get("content-type") || "";
      
      if (contentType.includes("application/json")) {
        try {
          data = await resp.json();
        } catch (jsonError) {
          console.warn("JSON parse error:", jsonError);
          data = { error: "Invalid JSON response" };
        }
      } else {
        const text = await resp.text();
        data = text || { error: "Empty response" };
      }

      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        console.log("📋 Response data:", data);
      }

      if (!resp.ok) {
        const errorMessage = formatError(data, resp.status);
        console.error("❌ Request failed:", errorMessage);
        
        // 特定錯誤不重試
        if (resp.status === 401 || resp.status === 403 || resp.status === 422) {
          throw new Error(errorMessage);
        }
        
        // 其他錯誤如果還有重試機會就繼續
        if (attempt < retries) {
          console.log(`Retrying in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        
        throw new Error(errorMessage);
      }

      return data;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      // 網路錯誤重試
      if (attempt < retries && (
        error.name === 'TypeError' || 
        error.message.includes('fetch') ||
        error.message.includes('NetworkError')
      )) {
        console.log(`Retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }

      // 最終失敗
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`無法連接到後端伺服器 (${API_BASE})。可能原因：
1. 伺服器離線或重啟中
2. 網路連線問題
3. CORS 設定問題
請稍後再試或聯繫管理員。`);
      }
      
      throw error;
    }
  }
}

// ====== 基本 API ======
export async function testConnection() {
  try {
    const result = await request("/api/health");
    console.log("✅ Connection test passed:", result);
    return result;
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    throw error;
  }
}

export async function apiJoin(pid, nickname) {
  try {
    console.log("🔐 Attempting login:", { pid, nickname });
    const result = await request("/api/auth/join", {
      method: "POST",
      body: { pid, nickname },
    });
    
    if (result?.token) {
      localStorage.setItem("token", result.token);
      console.log("✅ Token stored");
    }
    if (result?.user) {
      localStorage.setItem("user", JSON.stringify(result.user));
      console.log("✅ User info stored:", result.user);
    }
    return result;
  } catch (error) {
    console.error("❌ Login failed:", error.message);
    throw error;
  }
}

export async function apiMe() {
  try {
    return await request("/api/user/profile");
  } catch (error) {
    console.error("❌ Get profile failed:", error.message);
    throw error;
  }
}

// ====== 測評相關 ======
export async function saveAssessment(data) {
  try {
    console.log("💾 Saving assessment:", data);
    const processedData = {
      ...data,
      submittedAt: data.submittedAt || new Date().toISOString()
    };
    
    // 處理 MBTI 格式
    if (data.mbti && typeof data.mbti === 'object') {
      processedData.mbti_raw = data.mbti.raw;
      processedData.mbti_encoded = data.mbti.encoded;
      delete processedData.mbti;
    }
    
    const result = await request("/api/assessments/upsert", {
      method: "POST",
      body: processedData,
    });
    console.log("✅ Assessment saved:", result);
    return result;
  } catch (error) {
    console.error("❌ Save assessment failed:", error.message);
    throw error;
  }
}

export async function saveAssessmentMBTI(mbtiString, encodedArray) {
  try {
    console.log("💾 Saving MBTI:", { mbtiString, encodedArray });
    
    const mbti_raw = String(mbtiString).toUpperCase();
    const mbti_encoded = Array.isArray(encodedArray) ? encodedArray : [];
    
    if (mbti_encoded.length !== 4) {
      throw new Error("MBTI encoded array must have exactly 4 elements");
    }
    
    const result = await request("/api/assessments/upsert", {
      method: "POST",
      body: {
        mbti_raw,
        mbti_encoded,
        submittedAt: new Date().toISOString()
      },
    });
    console.log("✅ MBTI saved:", result);
    return result;
  } catch (error) {
    console.error("❌ MBTI save failed:", error.message);
    throw error;
  }
}

// ====== 配對相關 ======
export async function runMatching() {
  try {
    console.log("🤖 Running matching...");
    return await request("/api/match/recommend", { method: "POST" });
  } catch (error) {
    console.error("❌ Matching failed:", error.message);
    throw error;
  }
}

export async function commitChoice(botType) {
  try {
    console.log("🎯 Committing choice:", botType);
    return await request("/api/match/choose", {
      method: "POST",
      body: { bot_type: botType },
    });
  } catch (error) {
    console.error("❌ Commit choice failed:", error.message);
    throw error;
  }
}

// ====== 增強版聊天相關 ======

/**
 * 發送增強版聊天訊息 - 支援專業 persona 和情緒分析
 * @param {string} message - 使用者訊息
 * @param {string} botType - AI 類型 (empathy|insight|solution|cognitive)
 * @param {string} mode - 模式 (text|video)
 * @param {Array} history - 對話歷史
 * @param {Object} context - 上下文資訊
 * @returns {Promise<Object>} 增強版回應結果
 */
export async function sendChatMessage(message, botType, mode = "text", history = [], context = {}) {
  try {
    console.log("💬 Sending enhanced chat:", { 
      message: message.substring(0, 50), 
      botType, 
      mode,
      contextKeys: Object.keys(context)
    });
    
    // 取得使用者 ID
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userObj?.id ?? 0;
    
    const result = await request("/api/chat/send", {
      method: "POST",
      headers: {
        "X-User-Id": String(userId),
      },
      body: {
        message,
        bot_type: botType,
        mode,
        history,
        demo: false,
        context  // 增強：包含上下文資訊
      },
    });
    
    console.log("✅ Enhanced chat sent:", { 
      ok: result.ok, 
      hasReply: !!result.reply,
      hasEmotionalAnalysis: !!result.emotional_analysis,
      hasSuggestions: !!result.suggested_follow_up
    });
    
    return result;
  } catch (error) {
    console.error("❌ Enhanced chat send failed:", error.message);
    throw error;
  }
}

/**
 * 檢查 AI Persona 系統狀態
 */
export async function checkPersonaSystem() {
  try {
    console.log("🤖 Checking persona system...");
    return await request("/api/chat/health/personas");
  } catch (error) {
    console.error("❌ Persona system check failed:", error.message);
    throw error;
  }
}

/**
 * 獲取特定 AI 的詳細資訊
 * @param {string} botType - AI 類型
 */
export async function getPersonaInfo(botType) {
  try {
    console.log(`🔍 Getting persona info for: ${botType}`);
    return await request(`/api/chat/personas/${botType}/info`);
  } catch (error) {
    console.error(`❌ Get persona info failed for ${botType}:`, error.message);
    throw error;
  }
}

/**
 * 發送帶情緒上下文的訊息
 * @param {string} message - 訊息內容
 * @param {string} botType - AI 類型
 * @param {Object} emotionalContext - 情緒上下文
 */
export async function sendEmotionalMessage(message, botType, emotionalContext = {}) {
  const context = {
    emotional_state: emotionalContext,
    timestamp: new Date().toISOString(),
    requires_empathy: true
  };
  
  return sendChatMessage(message, botType, "text", [], context);
}

/**
 * 批次獲取所有 AI 類型的資訊
 */
export async function getAllPersonaInfo() {
  try {
    const botTypes = ['empathy', 'insight', 'solution', 'cognitive'];
    const results = {};
    
    for (const botType of botTypes) {
      try {
        results[botType] = await getPersonaInfo(botType);
      } catch (error) {
        console.warn(`Failed to get info for ${botType}:`, error.message);
        results[botType] = { error: error.message };
      }
    }
    
    return results;
  } catch (error) {
    console.error("❌ Get all persona info failed:", error.message);
    throw error;
  }
}

// ====== 舊版聊天 API（向後相容）======
export async function saveChatMessage(content, role = "user", botType = null, userMood = null, moodIntensity = null) {
  try {
    return await request("/api/chat/messages", {
      method: "POST",
      body: {
        content,
        role,
        bot_type: botType,
        mode: "text",
        user_mood: userMood,
        mood_intensity: moodIntensity
      },
    });
  } catch (error) {
    console.error("❌ Save chat message failed:", error.message);
    throw error;
  }
}

export async function getChatHistory(limit = 50) {
  try {
    return await request(`/api/chat/messages?limit=${limit}`);
  } catch (error) {
    console.error("❌ Get chat history failed:", error.message);
    throw error;
  }
}

// ====== 心情記錄 ======
export async function saveMoodRecord(mood, intensity, note = null) {
  try {
    return await request("/api/mood/records", {
      method: "POST",
      body: { mood, intensity, note },
    });
  } catch (error) {
    console.error("❌ Save mood failed:", error.message);
    throw error;
  }
}

export async function getMoodHistory(days = 30) {
  try {
    return await request(`/api/mood/records?days=${days}`);
  } catch (error) {
    console.error("❌ Get mood history failed:", error.message);
    throw error;
  }
}

// ====== 其他 API ======
export async function getMyAssessment() {
  try {
    return await request("/api/assessments/me");
  } catch (error) {
    console.error("❌ Get assessment failed:", error.message);
    throw error;
  }
}

export async function getMyMatchChoice() {
  try {
    return await request("/api/match/me");
  } catch (error) {
    console.error("❌ Get match failed:", error.message);
    throw error;
  }
}

export async function debugDbTest() {
  try {
    return await request("/api/debug/db-test");
  } catch (error) {
    console.error("❌ DB test failed:", error.message);
    throw error;
  }
}

// ====== 增強功能輔助函數 ======

/**
 * 分析訊息中的情緒關鍵字
 * @param {string} message - 訊息內容
 * @returns {Object} 情緒分析結果
 */
export function analyzeMessageEmotion(message) {
  const emotionKeywords = {
    joy: ["開心", "快樂", "興奮", "愉悅", "高興", "滿足"],
    sadness: ["難過", "傷心", "憂鬱", "沮喪", "失落", "悲傷"],
    anger: ["生氣", "憤怒", "煩躁", "火大", "氣憤", "不爽"],
    fear: ["害怕", "恐懼", "擴心", "緊張", "不安", "焦慮"],
    stress: ["壓力", "疲憊", "累", "負擔", "喘不過氣", "壓抑"],
    loneliness: ["孤單", "寂寞", "孤獨", "沒人懂", "一個人", "被忽視"]
  };

  const detected = [];
  const intensity = {
    high: ["非常", "極度", "超級", "完全", "總是", "永遠"],
    medium: ["很", "蠻", "還蠻", "有點"],
    low: ["一點", "稍微", "有時", "偶爾"]
  };

  let emotionLevel = "medium";

  // 檢測情緒
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    if (keywords.some(keyword => message.includes(keyword))) {
      detected.push(emotion);
    }
  });

  // 檢測強度
  Object.entries(intensity).forEach(([level, keywords]) => {
    if (keywords.some(keyword => message.includes(keyword))) {
      emotionLevel = level;
    }
  });

  return {
    emotions: detected,
    intensity: emotionLevel,
    hasEmotionalContent: detected.length > 0,
    needsSupport: emotionLevel === "high" || detected.some(e => ["sadness", "fear", "stress", "loneliness"].includes(e))
  };
}

/**
 * 根據情緒狀態推薦最適合的 AI 類型
 * @param {Object} emotionalAnalysis - 情緒分析結果
 * @returns {string} 推薦的 AI 類型
 */
export function recommendBotType(emotionalAnalysis) {
  const { emotions, intensity, needsSupport } = emotionalAnalysis;
  
  // 高強度負面情緒 → 同理型
  if (needsSupport && intensity === "high") {
    return "empathy";
  }
  
  // 複雜情緒或模式 → 洞察型
  if (emotions.length > 2 || emotions.includes("loneliness")) {
    return "insight";
  }
  
  // 壓力或行動需求 → 解決型
  if (emotions.includes("stress") || intensity === "low") {
    return "solution";
  }
  
  // 思維相關或焦慮 → 認知型
  if (emotions.includes("fear") || emotions.includes("anger")) {
    return "cognitive";
  }
  
  // 預設推薦
  return "empathy";
}

/**
 * 格式化聊天歷史為 API 所需格式
 * @param {Array} messages - 前端訊息陣列
 * @returns {Array} API 格式的歷史記錄
 */
export function formatChatHistory(messages) {
  return messages.map(msg => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.content,
    timestamp: msg.timestamp
  }));
}

/**
 * 驗證 Bot 類型是否有效
 * @param {string} botType - AI 類型
 * @returns {boolean} 是否有效
 */
export function isValidBotType(botType) {
  const validTypes = ['empathy', 'insight', 'solution', 'cognitive'];
  return validTypes.includes(botType);
}

/**
 * 獲取 Bot 的本地化資訊
 * @param {string} botType - AI 類型
 * @returns {Object} Bot 資訊
 */
export function getBotDisplayInfo(botType) {
  const botInfo = {
    empathy: {
      name: "Lumi",
      displayName: "同理型 AI",
      color: "#FFB6C1",
      icon: "❤️",
      description: "溫暖陪伴，情緒支持"
    },
    insight: {
      name: "Solin", 
      displayName: "洞察型 AI",
      color: "#7AC2DD",
      icon: "🔍",
      description: "深度探索，自我覺察"
    },
    solution: {
      name: "Niko",
      displayName: "解決型 AI", 
      color: "#9BB5E3",
      icon: "🎯",
      description: "實務導向，行動規劃"
    },
    cognitive: {
      name: "Clara",
      displayName: "認知型 AI",
      color: "#8D8DF2", 
      icon: "🧠",
      description: "思維重建，理性分析"
    }
  };
  
  return botInfo[botType] || botInfo.empathy;
}

// ====== 偵錯和監控功能 ======

/**
 * 記錄聊天互動數據
 * @param {Object} interactionData - 互動數據
 */
export function logChatInteraction(interactionData) {
  if (process.env.NODE_ENV === 'development') {
    console.log("💬 Chat Interaction:", {
      timestamp: new Date().toISOString(),
      ...interactionData
    });
  }
  
  // 可以在這裡添加分析追蹤代碼
  // 例如：Google Analytics, Mixpanel 等
}

/**
 * 檢查系統健康狀態
 */
export async function healthCheck() {
  try {
    const results = await Promise.allSettled([
      testConnection(),
      checkPersonaSystem()
    ]);
    
    const connectionResult = results[0];
    const personaResult = results[1];
    
    return {
      overall: connectionResult.status === 'fulfilled' && personaResult.status === 'fulfilled',
      connection: connectionResult.status === 'fulfilled' ? connectionResult.value : null,
      personas: personaResult.status === 'fulfilled' ? personaResult.value : null,
      errors: results.filter(r => r.status === 'rejected').map(r => r.reason?.message)
    };
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    return {
      overall: false,
      connection: null,
      personas: null,
      errors: [error.message]
    };
  }
}

// ====== 錯誤處理和重試機制 ======

/**
 * 帶有智能重試的聊天發送
 * @param {string} message - 訊息
 * @param {string} botType - AI 類型  
 * @param {Object} options - 選項
 */
export async function sendChatWithRetry(message, botType, options = {}) {
  const { maxRetries = 3, backoffMs = 1000, ...chatOptions } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendChatMessage(message, botType, "text", [], chatOptions.context || {});
      
      // 記錄成功的互動
      logChatInteraction({
        success: true,
        attempt,
        botType,
        messageLength: message.length,
        hasEmotionalAnalysis: !!result.emotional_analysis
      });
      
      return result;
    } catch (error) {
      console.warn(`Chat attempt ${attempt} failed:`, error.message);
      
      // 最後一次嘗試失敗
      if (attempt === maxRetries) {
        logChatInteraction({
          success: false,
          attempts: maxRetries,
          botType,
          error: error.message
        });
        throw error;
      }
      
      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, backoffMs * attempt));
    }
  }
}

// ====== 本地儲存管理 ======

/**
 * 儲存聊天偏好設定
 * @param {Object} preferences - 偏好設定
 */
export function saveChatPreferences(preferences) {
  try {
    const existing = JSON.parse(localStorage.getItem("chatPreferences") || "{}");
    const updated = { ...existing, ...preferences, updatedAt: new Date().toISOString() };
    localStorage.setItem("chatPreferences", JSON.stringify(updated));
    console.log("✅ Chat preferences saved:", updated);
  } catch (error) {
    console.error("❌ Failed to save chat preferences:", error);
  }
}

/**
 * 獲取聊天偏好設定
 * @returns {Object} 偏好設定
 */
export function getChatPreferences() {
  try {
    return JSON.parse(localStorage.getItem("chatPreferences") || "{}");
  } catch (error) {
    console.error("❌ Failed to get chat preferences:", error);
    return {};
  }
}

/**
 * 清理舊的聊天數據
 * @param {number} daysToKeep - 保留天數
 */
export function cleanupOldChatData(daysToKeep = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    // 這裡可以清理本地儲存的舊聊天記錄
    console.log(`🧹 Cleaning up chat data older than ${daysToKeep} days`);
    
    // 實作清理邏輯...
    
  } catch (error) {
    console.error("❌ Failed to cleanup old chat data:", error);
  }
}

// ====== 預設匯出 ======
export default {
  // 基本功能
  testConnection,
  apiJoin,
  apiMe,
  
  // 測評相關
  saveAssessment,
  saveAssessmentMBTI,
  
  // 配對相關
  runMatching,
  commitChoice,
  
  // 增強版聊天功能
  sendChatMessage,
  sendChatWithRetry,
  sendEmotionalMessage,
  checkPersonaSystem,
  getPersonaInfo,
  getAllPersonaInfo,
  
  // 舊版相容
  saveChatMessage,
  getChatHistory,
  
  // 心情記錄
  saveMoodRecord,
  getMoodHistory,
  
  // 其他
  getMyAssessment,
  getMyMatchChoice,
  debugDbTest,
  
  // 輔助功能
  analyzeMessageEmotion,
  recommendBotType,
  formatChatHistory,
  isValidBotType,
  getBotDisplayInfo,
  
  // 系統管理
  healthCheck,
  logChatInteraction,
  
  // 本地儲存
  saveChatPreferences,
  getChatPreferences,
  cleanupOldChatData
};