# Emobot 心理對話機器人系統

基於 AI 驅動的心理健康支援平台,透過心理測驗與智能推薦,為使用者匹配最適合的對話機器人類型。

## 系統架構

### 技術堆疊

**前端**
- React 18
- React Router v6
- Styled Components
- JavaScript (ES6+)

**後端**
- FastAPI (Python 3.9+)
- SQLAlchemy ORM
- PostgreSQL (Supabase)
- JWT 認證

**AI 整合**
- OpenAI GPT-4o (對話生成)
- HeyGen API (視訊對話)

**部署環境**
- 前端: Vercel
- 後端: Render
- 資料庫: Supabase (PostgreSQL)

### 系統特色

1. **四型機器人設計**
   - Lumi (同理型): 情感支持與陪伴
   - Solin (洞察型): 深度思考引導
   - Niko (解決型): 實務問題解決
   - Clara (認知型): 理性分析與認知重構

2. **智能推薦演算法**
   - 基於 MBTI 人格量表
   - 整合 AAS (依附風格量表)
   - 納入 DERS (情緒調節量表)
   - 結合 BPNS (基本心理需求量表)

3. **多模式對話**
   - 文字對話模式
   - 視訊對話模式 (HeyGen)
   - 心情記錄追蹤

## 專案結構

```
emobot/
├── frontend/                # React 前端
│   ├── src/
│   │   ├── components/     # UI 組件
│   │   ├── api/           # API 客戶端
│   │   ├── assets/        # 靜態資源
│   │   └── App.jsx        # 主應用程式
│   └── public/
│
├── backend/                # FastAPI 後端
│   ├── app/
│   │   ├── models/        # 資料模型
│   │   ├── services/      # 業務邏輯
│   │   ├── routers/       # API 路由
│   │   ├── core/          # 核心配置
│   │   ├── db/            # 資料庫配置
│   │   └── chat.py        # 聊天主模組
│   └── main.py            # 應用程式入口
│
└── README.md
```

## 快速開始

### 環境需求

- Node.js 16+
- Python 3.9+
- PostgreSQL 14+ (或使用 Supabase)

### 前端設定

```bash
cd frontend
npm install
```

建立 `.env` 檔案:
```env
VITE_API_BASE=https://emobot-backend.onrender.com
# 或本地開發
# VITE_API_BASE=http://localhost:8000
```

啟動開發伺服器:
```bash
npm start
```

### 後端設定

```bash
cd backend
pip install -r requirements.txt
```

建立 `.env` 檔案:
```env
# 資料庫連線
DATABASE_URL=postgresql://user:password@host:5432/database
POSTGRES_URL=postgresql://user:password@host:5432/database

# JWT 認證
JWT_SECRET=your-secret-key-change-in-production
JWT_ALG=HS256
JWT_EXPIRE_MINUTES=129600

# CORS 設定
ALLOWED_ORIGINS=https://emobot-plus.vercel.app,http://localhost:5173,http://localhost:3000

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# HeyGen API (選用)
HEYGEN_API_KEY=your-heygen-api-key
```

啟動後端服務:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API 端點

### 認證相關

```
POST   /api/auth/join          # 登入/註冊
GET    /api/user/me            # 取得使用者資訊
```

### 心理測驗

```
POST   /api/assessments/save   # 儲存測驗結果
GET    /api/assessments/me     # 取得最新測驗
GET    /api/assessments/history # 測驗歷史記錄
GET    /api/assessments/{id}   # 特定測驗詳情
```

### 推薦系統

```
POST   /api/match/recommend    # 執行推薦演算法
POST   /api/match/choose       # 選擇機器人
```

### 對話功能

```
POST   /api/chat/send          # 發送訊息
GET    /api/chat/history       # 對話歷史
GET    /api/chat/stats         # 對話統計
GET    /api/chat/first-time-check/{bot_type}  # 檢查首次對話
```

### 心情記錄

```
POST   /api/moods              # 記錄心情
GET    /api/moods/me           # 取得心情記錄
GET    /api/mood/analysis      # 心情分析
```

### 管理功能

```
GET    /api/admin/allowed-pids       # PID 白名單
POST   /api/admin/allowed-pids       # 新增 PID
PATCH  /api/admin/allowed-pids/{id}  # 更新 PID
DELETE /api/admin/allowed-pids/{id}  # 刪除 PID
GET    /api/admin/stats              # 系統統計
POST   /api/admin/cleanup-sessions   # 清理非活躍會話
```

## 資料模型

### User (使用者)
- `pid`: 使用者識別碼 (主鍵)
- `nickname`: 暱稱
- `user_flow_stage`: 使用者流程階段
- `created_at`: 建立時間

### Assessment (測驗記錄)
- `id`: 自動遞增 ID
- `user_pid`: 關聯使用者
- `mbti_raw`: MBTI 類型字串
- `mbti_encoded`: MBTI 編碼陣列
- `step2_answers`: AAS 量表答案
- `step3_answers`: DERS 量表答案
- `step4_answers`: BPNS 量表答案
- `submitted_at`: 提交時間

### Chat (對話記錄)
- `id`: 對話 ID
- `user_pid`: 關聯使用者
- `bot_type`: 機器人類型
- `user_message`: 使用者訊息
- `bot_reply`: 機器人回覆
- `timestamp`: 時間戳記

### Mood (心情記錄)
- `id`: 記錄 ID
- `user_pid`: 關聯使用者
- `score`: 心情分數 (1-10)
- `note`: 備註
- `tags`: 標籤陣列
- `created_at`: 建立時間

## 核心功能流程

### 1. 使用者註冊與測驗

```
登入/註冊 → MBTI 測驗 → AAS 量表 → DERS 量表 → BPNS 量表 → AI 偏好選擇
```

### 2. 推薦演算法

系統根據測驗結果計算四種機器人的匹配分數:

```python
# 同理型分數計算
empathy = 0.35 * aas["anx"] + 
          0.20 * (1 - bpns["relatedness"]) +
          0.15 * (1 - bpns["competence"]) +
          0.15 * mbti["F"] + 
          0.10 * mbti["I"] +
          0.05 * ders["level"]

# 洞察型分數計算
insight = 0.30 * mbti["N"] + 
          0.20 * mbti["T"] +
          0.25 * bpns["autonomy"] + 
          0.15 * bpns["competence"] +
          0.10 * (1 - aas["avoid"])

# 解決型分數計算
solution = 0.30 * mbti["J"] + 
           0.20 * mbti["T"] +
           0.25 * bpns["competence"] + 
           0.15 * bpns["autonomy"] +
           0.10 * (1 - ders["level"])

# 認知型分數計算
cognitive = 0.40 * ders["level"] + 
            0.15 * ders["spread"] +
            0.20 * mbti["I"] + 
            0.15 * mbti["N"] +
            0.10 * (1 - bpns["autonomy"])
```

### 3. 對話互動

使用者可選擇推薦的機器人或自行選擇其他類型,進行個人化對話。

## 部署說明

### Vercel 前端部署

1. 連接 GitHub 儲存庫
2. 設定環境變數:
   - `VITE_API_BASE`: 後端 API 網址
3. 建置命令: `npm run build`
4. 輸出目錄: `build`

### Render 後端部署

1. 連接 GitHub 儲存庫
2. 設定環境變數 (如上述 `.env` 範例)
3. 建置命令: `pip install -r requirements.txt`
4. 啟動命令: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Supabase 資料庫設定

1. 建立新專案
2. 取得資料庫連線字串
3. 執行資料表初始化 (系統會自動建立)

## 安全性考量

- JWT Token 過期時間: 90 天
- CORS 嚴格限制允許來源
- Supabase 使用 SSL 連線
- 環境變數分離管理
- API 請求需要認證標頭

## 效能優化

- SQLAlchemy 連線池管理
- FastAPI 非同步處理
- React 路由懶載入
- Service Worker 快取策略
- 資料庫索引優化

## 開發指南

### 新增機器人類型

1. 在 `botPersonas.js` 定義新機器人特性
2. 更新 `recommendation_engine.py` 計算邏輯
3. 調整前端 UI 組件
4. 建立對應的對話提示詞

### 擴充心理量表

1. 在測驗步驟組件新增題目
2. 更新 `recommendation_engine.py` 特徵提取
3. 調整推薦演算法權重
4. 更新資料模型欄位

## 已知問題

- HeyGen 視訊模式需要額外付費授權
- 大量並發請求可能觸發 OpenAI 速率限制
- Safari 瀏覽器 Service Worker 支援有限

## 授權資訊

本專案僅供學術研究與教育用途。

## 聯絡方式

如有問題或建議,請透過 GitHub Issues 回報。

---

**版本**: 0.7.0  
**最後更新**: 2025 年 10 月