# 🏮 Viet Lac So — BaZi Analysis Platform

> Nền tảng phân tích Tứ Trụ (Bát Tự) chuyên sâu, tích hợp AI tư vấn, được xây dựng với React 19 & Node.js.

*[🇬🇧 English Version](README.en.md)*

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)]()
[![React](https://img.shields.io/badge/react-19.2-61dafb.svg)]()

---

## 📖 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng Chính](#-tính-năng-chính)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cài Đặt & Chạy](#-cài-đặt--chạy)
- [Docker & Easypanel](#docker--easypanel)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [API Endpoints](#-api-endpoints)
- [Hướng dẫn xác thực qua API Key](#hướng-dẫn-xác-thực-qua-api-key)
- [Engine Bát Tự](#-engine-bát-tự)
- [Bảo Mật](#-bảo-mật)

---

## 🌟 Giới Thiệu

**Viet Lac So** là nền tảng phân tích mệnh lý Tứ Trụ (Bát Tự / BaZi) toàn diện, kết hợp thuật toán tính toán truyền thống với trí tuệ nhân tạo (AI) để cung cấp luận giải chuyên sâu. Hệ thống hỗ trợ đầy đủ lịch Âm - Dương, chuyển đổi Can Chi, và phân tích Ngũ Hành theo mệnh lý học Đông phương.

---

## ✨ Tính Năng Chính

### 1. 📊 Lá Số Bát Tự (BaZi Chart)
- **Lập lá số Tứ Trụ** đầy đủ: Năm - Tháng - Ngày - Giờ với Thiên Can & Địa Chi
- **Biểu đồ Ngũ Hành Radar** trực quan — hiển thị tỷ lệ Kim, Mộc, Thủy, Hỏa, Thổ
- **Chi tiết lá số** bao gồm: Tàng Can, Thập Thần, Nạp Âm, Không Vong
- **Hỗ trợ lịch Âm & Dương** — tự động chuyển đổi chính xác qua thư viện `lunar-javascript`
- **Xuất file**: Xuất lá số dạng hình ảnh (PNG) hoặc PDF

### 2. 📈 Đại Vận & Lưu Niên (Luck Cycles)
- **Đại Vận (10-year cycles)**: Tính toán và hiển thị các chu kỳ đại vận suốt đời
- **Lưu Niên (Annual cycles)**: Phân tích vận hạn từng năm chi tiết
- **Tiểu Vận & Nguyệt Vận**: Phân tích vận hạn theo tháng, theo tiểu vận
- **Biểu đồ trực quan**: Timeline tương tác hiển thị vận mệnh qua các giai đoạn

### 3. 🔮 Luận Giải Chuyên Sâu (Interpretation)

#### Ma Trận Phân Tích (Matrix Analysis)
- **Quan hệ Can Chi**: Hợp, Xung, Hình, Hại, Phá giữa các trụ
- **Thập Thần phân tích**: Chính Quan, Thiên Quan, Chính Ấn, Thiên Ấn, Tỷ Kiên, Kiếp Tài, Thực Thần, Thương Quan, Chính Tài, Thiên Tài
- **Cách Cục nhận diện**: Xác định cách cục chủ đạo của lá số
- **Điểm số Ngũ Hành**: Tính điểm và cân bằng Ngũ Hành chi tiết

#### Điển Tích Cổ Văn (Classic Texts)
- **Trích dẫn kinh điển** từ Tử Bình Chân Thuyên, Trích Thiên Tùy
- **Luận giải cổ văn** áp dụng vào lá số cá nhân
- **Bệnh Dược luận**: Phân tích bệnh và thuốc trong lá số
- **Đồng Tình Luận**: Phân tích đồng khí tương cầu
- **Kim Bất Hoán**: Phân tích khí chất quý hiếm

### 4. 🤖 Tư Vấn AI (AI Consultant)
- **Hỏi đáp AI thông minh**: Đặt câu hỏi tự do về lá số, nhận phân tích sâu từ AI
- **Hiệu ứng Typewriter**: Hiển thị câu trả lời AI từng ký tự, tạo trải nghiệm tương tác
- **Câu hỏi gợi ý**: Hệ thống câu hỏi mẫu thông dụng theo chủ đề (sự nghiệp, tình cảm, sức khỏe, tài lộc...)
- **Quản lý câu hỏi**: Admin có thể thêm/sửa/xóa câu hỏi gợi ý theo danh mục
- **Lịch sử tư vấn**: Lưu trữ toàn bộ lịch sử hỏi đáp của từng khách hàng
- **Tích hợp OpenRouter API**: Sử dụng các mô hình AI tiên tiến (DeepSeek, GPT...)

### 5. 💑 Hợp Duyên (Matching)
- **So sánh lá số 2 người**: Phân tích tương hợp giữa hai lá số Bát Tự
- **Điểm hợp duyên**: Tính điểm tương hợp dựa trên Ngũ Hành, Nạp Âm, Can Chi
- **Luận giải mối quan hệ**: Phân tích chi tiết điểm mạnh/yếu của mối quan hệ
- **Hỗ trợ nhập liệu linh hoạt**: Nhập thông tin người thứ hai trực tiếp trên giao diện

### 6. 📅 Chọn Ngày Tốt (Date Selection)

#### Xem Ngày Cá Nhân (Personalized Date)
- **Phân tích ngày theo lá số**: Đánh giá ngày tốt/xấu dựa trên lá số cá nhân
- **Phân loại hoạt động**: Gợi ý ngày phù hợp cho từng loại sự kiện

#### Chọn Ngày Hoàng Đạo (Auspicious Date Picker)
- **Lịch chọn ngày tương tác**: Giao diện lịch trực quan để chọn ngày tốt
- **Tiêu chí tùy chỉnh**: Lọc ngày theo mục đích (khai trương, cưới hỏi, xây nhà...)

### 7. 🎴 Xin Quẻ (Hexagram / Que)
- **Xin quẻ Kinh Dịch**: Gieo quẻ ngẫu nhiên hoặc theo câu hỏi
- **64 quẻ đầy đủ**: Dữ liệu đầy đủ 64 quẻ Kinh Dịch với luận giải
- **Luận giải quẻ chi tiết**: Phân tích hào biến, quẻ hỗ, quẻ biến

### 8. 📝 Bài Viết & Kiến Thức (Articles)
- **Hệ thống bài viết**: Quản lý và hiển thị bài viết về mệnh lý học
- **Slug URL thân thiện**: Đường dẫn bài viết tối ưu SEO
- **Markdown rendering**: Hỗ trợ viết bài bằng Markdown với `react-markdown`

### 9. 👤 Quản Lý Người Dùng (Authentication)
- **Đăng ký / Đăng nhập**: Hệ thống xác thực JWT (JSON Web Token)
- **Phân quyền**: Phân biệt User thường và Admin
- **Hồ sơ cá nhân**: Quản lý thông tin cá nhân, xem hồ sơ

### 10. 🛠️ Trang Quản Trị (Admin Panel)
- **Dashboard quản trị**: Giao diện admin toàn diện (55K+ dòng code)
- **Quản lý câu hỏi gợi ý**: Thêm, sửa, xóa câu hỏi mẫu theo danh mục
- **Quản lý bài viết**: CRUD bài viết kiến thức
- **Quản lý người dùng**: Xem và quản lý tài khoản
- **Nhật ký truy cập (Access Logs)**: Theo dõi lượt truy cập, IP, response time
- **Thống kê hệ thống**: Tổng quan hoạt động và hiệu suất

### 11. 📱 Responsive Design
- **Mobile Shell**: Giao diện tối ưu cho di động với navigation riêng
- **Desktop Shell**: Layout chuyên nghiệp cho màn hình lớn
- **Tự động detect**: Tự động chuyển đổi giữa Mobile/Desktop dựa trên kích thước màn hình

### 12. 📤 Xuất Dữ Liệu (Export)
- **Xuất hình ảnh (PNG)**: Chụp lá số dạng hình ảnh chất lượng cao với `html2canvas`
- **Xuất PDF**: Tạo file PDF chuyên nghiệp với `jsPDF`

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                        │
│         React 19 + Vite (Port 3005)             │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ BaziChart│  │ LuckCycle│  │  AI Consult   │  │
│  │  Module  │  │  Module  │  │    Module     │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │          │
│       └──────────────┼───────────────┘          │
│                      │                          │
│              ┌───────┴───────┐                  │
│              │  API Client   │                  │
│              └───────┬───────┘                  │
└──────────────────────┼──────────────────────────┘
                       │  Vite Proxy (/api → :8888)
┌──────────────────────┼──────────────────────────┐
│                SERVER│                          │
│        Express.js (Port 8888)                   │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  BaZi    │  │  Auth    │  │  OpenRouter   │  │
│  │  Engine  │  │  (JWT)   │  │  AI Service   │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │          │
│       └──────────────┼───────────────┘          │
│                      │                          │
│              ┌───────┴───────┐                  │
│              │   SQLite DB   │                  │
│              │  (sql.js)     │                  │
│              └───────────────┘                  │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|---|---|---|
| React | 19.2 | UI framework |
| Vite | 7.2 | Build tool & dev server |
| React Router DOM | 7.1 | Client-side routing |
| react-markdown | 10.1 | Render Markdown content |
| react-helmet-async | 2.0 | SEO meta tags |
| html2canvas | 1.4 | Chụp ảnh lá số |
| jsPDF | 3.0 | Xuất PDF |
| canvas-confetti | 1.9 | Hiệu ứng confetti |

### Backend
| Công nghệ | Phiên bản | Mô tả |
|---|---|---|
| Express.js | 4.18 | Web framework |
| SQLite (sql.js) | 1.10 | Database embedded |
| lunar-javascript | 1.6 | Tính toán lịch Âm |
| jsonwebtoken | 9.0 | Xác thực JWT |
| helmet | 7.1 | HTTP security headers |
| express-rate-limit | 8.2 | Giới hạn request |
| compression | 1.8 | Gzip compression |
| lru-cache | 5.1 | In-memory caching |

### DevOps
| Công nghệ | Mô tả |
|---|---|
| npm Workspaces | Monorepo management |
| concurrently | Chạy đồng thời frontend & backend |
| nodemon | Auto-reload backend khi dev |
| ESLint | Code linting |
| Jest | Unit testing |

---

## 🚀 Cài Đặt & Chạy

### Yêu cầu
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

### 1. Clone & Cài đặt

```bash
git clone <repository-url>
cd tinix-bazi

# Cài đặt tất cả dependencies (root + workspaces)
npm install
```

### 2. Cấu hình Backend

```bash
# Copy file cấu hình mẫu
cp backendjs/.env.example backendjs/.env
```

Mở `backendjs/.env` và điền API key:

```env
PORT=8888
NODE_ENV=development

# OpenRouter AI Configuration
# Lấy key tại: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=deepseek/deepseek-chat
```

> **Note:** Các tính năng không cần AI (lá số, đại vận, phân tích, chọn ngày...) vẫn hoạt động bình thường mà không cần API key. Chỉ tính năng Tư vấn AI và Hợp Duyên AI cần API key.

### 3. Chạy Development

```bash
# Chạy cả Frontend + Backend đồng thời
npm run dev

# Hoặc chạy riêng lẻ
npm run dev:frontend   # React app tại http://localhost:3005
npm run dev:backend    # API server tại http://localhost:8888
```

### 4. Build Production

```bash
npm run build   # Build frontend → frontend/dist/
# Để phục vụ SPA + API cùng một Node: copy bản build vào backendjs/public
rm -rf backendjs/public && mkdir -p backendjs/public && cp -r frontend/dist/* backendjs/public/
npm start       # http://localhost:8888 — giao diện tại /, API tại /api/*
```

Nếu **không** có thư mục `backendjs/public`, `npm start` chỉ chạy API (JSON tại `GET /`, health tại `GET /api/health`).

### 5. Docker & Easypanel

- **Dockerfile** (root): build multi-stage với `npm ci`, copy `frontend/dist` → `backendjs/public`, một process `node server.js` lắng nghe cổng **8888** (hoặc `PORT`).
- **SQLite**: mount volume vào **`/app/backendjs/data`** trong container để giữ `bazi_consultant.db` khi redeploy.
- **Admin seed mặc định**: đặt `AUTO_SEED_ADMINS=false` trên production để tránh tự tạo tài khoản admin mặc định khi restart/redeploy. Chỉ bật `AUTO_SEED_ADMINS=true` khi bạn chủ động bootstrap admin.
- **Bootstrap admin cho local/dev**: khi cần seed 2 tài khoản mặc định (`quangld@vilapa.com`, `dev@vilapa.com`), cấu hình thêm `SEED_ADMIN_1_PASSWORD` và `SEED_ADMIN_2_PASSWORD`. Nếu thiếu biến nào, backend sẽ bỏ qua account tương ứng và ghi log cảnh báo.
- **Reverse proxy**: trong `backendjs/.env` hoặc biến môi trường panel đặt `TRUST_PROXY=1` khi chạy sau proxy (xem `backendjs/.env.example`).
- Triển khai trên Easypanel: tạo [App Service](https://easypanel.io/docs/services/app), nguồn Git + Dockerfile; **Proxy port** = 8888 (hoặc đúng `PORT`); biến môi trường dán tương đương `.env` (không cần mount file `.env` nếu khai báo trên panel).

```bash
docker build -t tinix-bazi .
docker run --rm -p 8888:8888 \
  -e TRUST_PROXY=1 \
  -v tinix-bazi-data:/app/backendjs/data \
  tinix-bazi
```

---

## 📁 Cấu Trúc Thư Mục

```
tinix-bazi/
├── package.json              # Root monorepo config (npm workspaces)
│
├── frontend/                 # 🎨 React 19 + Vite
│   ├── index.html
│   ├── vite.config.js        # Dev server port 3005, proxy /api → 8888
│   └── src/
│       ├── App.jsx           # Root component, routing
│       ├── main.jsx          # Entry point
│       ├── index.css         # Global styles (design system)
│       │
│       ├── features/         # 📦 Feature modules
│       │   ├── Homepage/     # Form nhập thông tin sinh
│       │   ├── BaziChart/    # Lá số, biểu đồ radar, chi tiết
│       │   ├── LuckCycles/   # Đại vận & Lưu niên
│       │   ├── Interpretation/ # Ma trận phân tích, Điển tích
│       │   ├── Consultant/   # Tư vấn AI
│       │   ├── Matching/     # Hợp duyên
│       │   ├── DateSelection/ # Chọn ngày tốt
│       │   ├── Que/          # Xin quẻ Kinh Dịch
│       │   ├── Articles/     # Bài viết
│       │   ├── Admin/        # Trang quản trị
│       │   └── ConsultationHistory/ # Lịch sử tư vấn
│       │
│       ├── components/       # 🧩 Shared components
│       │   ├── MobileShell.jsx
│       │   ├── DesktopShell.jsx
│       │   ├── AuthModal.jsx
│       │   ├── ComprehensiveInterpretation.jsx
│       │   └── common/       # SEO, Toast, etc.
│       │
│       ├── hooks/            # Custom React hooks
│       │   ├── useBaziApi.js
│       │   └── useWindowSize.js
│       │
│       ├── context/          # React Context
│       │   └── AuthContext.jsx
│       │
│       ├── services/         # API & Export services
│       │   ├── apiClient.js
│       │   ├── imageExport.js
│       │   └── pdfExport.js
│       │
│       └── theme/            # Theme configuration
│
├── backendjs/                # ⚙️ Express.js API
│   ├── server.js             # Entry point, middleware, routes
│   ├── .env                  # Environment variables
│   ├── data/                 # SQLite database files
│   │
│   └── src/
│       ├── bazi/             # 🧮 BaZi Calculation Engine
│       │   ├── calculator.js # Core calculation logic
│       │   ├── core.js       # Engine initialization
│       │   ├── ganzhi.js     # Can Chi (Heavenly Stems & Earthly Branches)
│       │   ├── ganzhi_data.js # Dữ liệu Can Chi (153KB)
│       │   ├── shensha.js    # Thần Sát (44KB)
│       │   ├── dayun.js      # Đại Vận calculation
│       │   ├── liunian.js    # Lưu Niên calculation
│       │   ├── geju.js       # Cách Cục analysis
│       │   ├── output.js     # Output formatting
│       │   ├── scoring_data.js # Scoring algorithms
│       │   │
│       │   ├── phan_tich/    # 📐 Phân tích modules
│       │   │   ├── quan_he.js          # Quan hệ Can Chi
│       │   │   ├── ngu_hanh.js         # Ngũ Hành analysis
│       │   │   ├── luan_tinh.js        # Luận tính cách
│       │   │   ├── luan_dong.js        # Luận động
│       │   │   ├── dong_tinh_luan.js   # Đồng Tình Luận
│       │   │   ├── dich_thien_tuy.js   # Trích Thiên Tùy
│       │   │   ├── tu_binh_chan_thuyen.js # Tử Bình Chân Thuyên
│       │   │   ├── benh_duoc.js        # Bệnh Dược
│       │   │   ├── kim_bat_hoan.js     # Kim Bất Hoán
│       │   │   ├── hinh_hai_pha.js     # Hình Hại Phá
│       │   │   ├── vong_trang_sinh.js  # Vòng Tràng Sinh
│       │   │   └── nap_am_chuyen_sau.js # Nạp Âm chuyên sâu
│       │   │
│       │   ├── luan_giai/    # 📜 Luận giải engine
│       │   ├── shishen/      # Thập Thần data
│       │   ├── hop_hon/      # Hợp Hôn (marriage matching)
│       │   ├── que_data/     # Kinh Dịch 64 quẻ data
│       │   ├── questions/    # Câu hỏi gợi ý data
│       │   └── thoi_gian_luan/ # Thời gian luận
│       │
│       ├── routes/           # 🛣️ API Routes
│       │   ├── bazi.routes.js       # BaZi analysis endpoints
│       │   ├── consultant.routes.js # AI consultant endpoints
│       │   ├── auth.routes.js       # Authentication endpoints
│       │   ├── admin.routes.js      # Admin endpoints
│       │   ├── articles.routes.js   # Articles CRUD
│       │   └── que.routes.js        # Hexagram endpoints
│       │
│       ├── services/         # 💼 Business Services
│       │   ├── bazi.service.js       # BaZi calculation orchestration
│       │   ├── openrouter.service.js # OpenRouter AI integration
│       │   ├── database.service.js   # SQLite operations (52KB)
│       │   ├── cache.service.js      # LRU caching
│       │   └── que.service.js        # Hexagram service
│       │
│       ├── middleware/       # 🔒 Express middleware
│       └── utils/            # 🔧 Utility functions
```

---

## 📡 API Endpoints

### BaZi Analysis
| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/analyze` | Phân tích Bát Tự đầy đủ (yêu cầu đăng nhập) |
| `GET` | `/api/chart` | Thông tin lá số cơ bản (yêu cầu đăng nhập) |
| `GET` | `/api/elements` | Phân tích Ngũ Hành (yêu cầu đăng nhập) |
| `GET` | `/api/stars` | Phân tích Thần Sát (yêu cầu đăng nhập) |
| `GET` | `/api/luck-cycles` | Phân tích Đại Vận (yêu cầu đăng nhập) |
| `GET` | `/api/year-analysis` | Phân tích Lưu Niên (yêu cầu đăng nhập) |
| `GET` | `/api/auspicious-dates` | Xem ngày tốt xấu (yêu cầu đăng nhập) |

#### Tham số
| Param | Type | Required | Mô tả |
|---|---|---|---|
| `year` | number | ✅ | Năm sinh |
| `month` | number | ✅ | Tháng sinh |
| `day` | number | ✅ | Ngày sinh |
| `hour` | number | ❌ | Giờ sinh (mặc định: 12) |
| `minute` | number | ❌ | Phút sinh (mặc định: 0) |
| `gender` | string | ❌ | "Nam" hoặc "Nữ" (mặc định: "Nam") |
| `calendar` | string | ❌ | "solar" hoặc "lunar" (mặc định: "solar") |
| `timeZone` | string | ❌ | IANA timezone, ví dụ `Asia/Ho_Chi_Minh` (mặc định/fallback: `Asia/Ho_Chi_Minh`) |

#### Hướng dẫn gửi data qua REST API (query vs body)

- Các endpoint `GET` (ví dụ `/api/analyze`) nhận data qua **query string**.
- Các endpoint `POST` (ví dụ `/api/auth/register`, `/api/matching`) nhận data qua **JSON body**.
- Luôn gửi `Authorization` theo rule endpoint (`Bearer` hoặc `ApiKey`) và thêm `Content-Type: application/json` cho request có body.

**Ví dụ GET `/api/analyze` (query params):**

```bash
curl -s -G "http://localhost:8888/api/analyze" \
  -H "Authorization: ApiKey YOUR_USER_API_KEY" \
  --data-urlencode "year=1992" \
  --data-urlencode "month=12" \
  --data-urlencode "day=8" \
  --data-urlencode "hour=10" \
  --data-urlencode "minute=0" \
  --data-urlencode "gender=Nam" \
  --data-urlencode "calendar=solar" \
  --data-urlencode "timeZone=Asia/Ho_Chi_Minh" \
  --data-urlencode "name=Nguyen Van A"
```

**Ví dụ POST `/api/auth/register` (JSON body):**

```bash
curl -s -X POST "http://localhost:8888/api/auth/register" \
  -H "Authorization: ApiKey YOUR_API_KEY_REGISTER_VALUE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "u@example.com",
    "username": "user1",
    "password": "secret",
    "name": "User One"
  }'
```

**Ví dụ POST `/api/matching` (JSON body):**

```bash
curl -s -X POST "http://localhost:8888/api/matching" \
  -H "Authorization: ApiKey YOUR_USER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "person1": { "year": 1990, "month": 5, "day": 15, "hour": 10, "gender": "Nam", "name": "A" },
    "person2": { "year": 1992, "month": 8, "day": 22, "hour": 9, "gender": "Nữ", "name": "B" },
    "relationship": "romance"
  }'
```

### AI Consultant
| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/api/consultant/ask` | Hỏi AI tư vấn (đang tắt theo policy mặc định) |
| `GET` | `/api/consultant/stats` | Thống kê tư vấn (yêu cầu đăng nhập) |
| `GET` | `/api/consultant/customers` | Danh sách khách hàng (yêu cầu đăng nhập) |
| `GET` | `/api/consultant/history/:id` | Lịch sử tư vấn (yêu cầu đăng nhập) |

### Authentication
| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/api/auth/register` | Đăng ký tài khoản (yêu cầu `Authorization: ApiKey <API_KEY_REGISTER>`) |
| `POST` | `/api/auth/login` | Đăng nhập |
| `GET` | `/api/users/me` | Lấy thông tin user hiện tại (Bearer hoặc ApiKey user) |

### Hướng dẫn xác thực qua API Key

Mọi route có quyền **`auth`** trong [`backendjs/route-permissions.json`](backendjs/route-permissions.json) đều chấp nhận **một trong hai** cách (xử lý trong `authMiddleware`):

1. **Phiên đăng nhập (web)**: `Authorization: Bearer <session_token>` — token trả về từ `POST /api/auth/login`.
2. **API Key người dùng (B2B / script)**: `Authorization: ApiKey <user_api_key>` — key dạng plaintext do server tạo **một lần** khi đăng ký thành công, lưu dạng hash (SHA-256) trong DB; mỗi request server so khớp hash.

**Định dạng header (bắt buộc đúng từ khóa `ApiKey` và một khoảng trắng):**

```http
Authorization: ApiKey your_key_here
```

**Ba loại “API key” trong hệ thống (không lẫn nhau):**

| Loại | Biến môi trường / nguồn | Mục đích |
|---|---|---|
| **Khóa đăng ký** | `API_KEY_REGISTER` trong `backendjs/.env` | Bắt buộc để gọi `POST /api/auth/register`: gửi `Authorization: ApiKey <API_KEY_REGISTER>` **hoặc** trường `inviteCode` trong body trùng giá trị này. Server không chạy đăng ký công khai nếu chưa cấu hình biến này. |
| **Khóa quản trị** | `API_KEY_MANAGE` trong `backendjs/.env` | Thay cho session admin: `Authorization: ApiKey <API_KEY_MANAGE>` để thỏa rule **`admin`** (ví dụ `POST /api/articles`, `/api/admin/*`). Giá trị so khớp **trực tiếp** với env (không qua bảng user). |
| **API Key của user** | Trả về trong JSON đăng ký (`apiKey`) — **chỉ hiện lần đầu** | Dùng cho mọi endpoint `auth` như Bearer: phân tích lá số, consultant, v.v. Nếu mất key, cần luồng đăng nhập web hoặc cấp lại key (nếu có tính năng backend tương ứng). |

**Ví dụ: gọi API phân tích với user API key**

```bash
curl -s -H "Authorization: ApiKey YOUR_USER_API_KEY" \
  "http://localhost:8888/api/analyze?year=1990&month=5&day=15&hour=10&gender=Nam&calendar=solar"
```

**Ví dụ: đăng ký tài khoản (cần khóa đăng ký)**

```bash
curl -s -X POST "http://localhost:8888/api/auth/register" \
  -H "Authorization: ApiKey YOUR_API_KEY_REGISTER_VALUE" \
  -H "Content-Type: application/json" \
  -d '{"email":"u@example.com","username":"user1","password":"secret","name":"User One"}'
```

**Lưu ý bảo mật**

- Chỉ gửi key qua **HTTPS** trên môi trường thật.
- Không commit `API_KEY_REGISTER`, `API_KEY_MANAGE` hay user API key vào git; đặt trong `backendjs/.env` hoặc secret manager.
- User API key có quyền tương đương phiên đăng nhập của user đó (credit, khóa tài khoản… vẫn áp dụng).

### Articles & Admin
| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/articles` | Danh sách bài viết |
| `GET/POST/PUT/DELETE` | `/api/admin/*` | Quản trị hệ thống |
| `GET/POST` | `/api/que/*` | Xin quẻ & luận giải |
| `POST` | `/api/admin/users/:id/credits/deposit` | Cộng credits cho user |
| `POST` | `/api/admin/users/:id/credits/withdraw` | Trừ credits cho user |

### Ma trận phân quyền API
| Mức quyền | Header | Ghi chú |
|---|---|---|
| `Public` | Không cần | Truy cập tự do theo rule trong file policy |
| `Authenticated` | `Authorization: Bearer <session_token>` **hoặc** `Authorization: ApiKey <user_api_key>` | Rule `auth` |
| `Admin` | Session user có `is_admin = 1` | Rule `admin` |
| `Manage Key` | `Authorization: ApiKey <API_KEY_MANAGE>` | Có thể đi qua rule `admin` |
| `Disabled` | Không áp dụng | Trả về `503` từ policy |

#### Policy-driven authorization
- File cấu hình: `backendjs/route-permissions.json`.
- Biến môi trường: `ROUTE_PERMISSIONS_FILE=./route-permissions.json` (trong `backendjs/.env`).
- Cơ chế match: `exact` trước, sau đó `prefix wildcard` (ví dụ `GET /api/admin/*`).
- Route không có rule sẽ dùng mặc định `auth`.
- Chỉnh quyền endpoint chỉ cần sửa policy file và restart backend.

#### Trạng thái mặc định hiện tại
- `POST /api/auth/register`, `POST /api/auth/login`: `public`.
- `POST /api/consultant/ask`: `disabled`.
- `/api/admin/*`: `admin` (có thể dùng `API_KEY_MANAGE`).
- Hầu hết route còn lại: `auth` (theo explicit rule hoặc fallback mặc định).

---

## 🧮 Engine Bát Tự

Engine tính toán Bát Tự được xây dựng hoàn toàn bằng JavaScript, bao gồm:

### Tính toán cốt lõi
- **Can Chi (干支)**: Tính Thiên Can & Địa Chi cho Năm, Tháng, Ngày, Giờ
- **Tàng Can (藏干)**: Xác định Can ẩn trong mỗi Địa Chi
- **Thập Thần (十神)**: Tính mối quan hệ 10 thần giữa Nhật Chủ và các Can
- **Nạp Âm (納音)**: Tra cứu Nạp Âm Ngũ Hành cho mỗi cặp Can Chi

### Phân tích chuyên sâu
- **Thần Sát (神煞)**: Tính toán 40+ loại Thần Sát (Quý Nhân, Đào Hoa, Dịch Mã, Kiếp Sát...)
- **Cách Cục (格局)**: Nhận diện cách cục đặc biệt của lá số
- **Ngũ Hành Điểm Số**: Tính điểm các hành Kim, Mộc, Thủy, Hỏa, Thổ
- **Vòng Tràng Sinh**: Xác định trạng thái Tràng Sinh, Mộc Dục, Quan Đái...

### Quan hệ Can Chi
- **Thiên Can**: Hợp, Xung
- **Địa Chi**: Tam Hợp, Lục Hợp, Lục Xung, Hình, Hại, Phá, Bán Hợp

### Luận giải Kinh Điển
- **Tử Bình Chân Thuyên** — trích dẫn & áp dụng
- **Trích Thiên Tùy** — phân tích theo cổ thư
- **Bệnh Dược Luận** — chẩn đoán bệnh/thuốc của lá số
- **Đồng Tình Luận** — phân tích khí đồng loại
- **Kim Bất Hoán** — đánh giá khí chất quý

---

## 🔒 Bảo Mật

- **API Key (B2B / tích hợp)**: Xem [Hướng dẫn xác thực qua API Key](#hướng-dẫn-xác-thực-qua-api-key) (header `Authorization`, `API_KEY_REGISTER`, `API_KEY_MANAGE`, key user).
- **Helmet.js**: HTTP security headers
- **Rate Limiting**: 3 tầng giới hạn request (cấu hình qua biến môi trường trong `backendjs/.env`; nếu không set thì dùng mặc định)
  - General: `RATE_LIMIT_GENERAL_MAX` / `RATE_LIMIT_GENERAL_WINDOW_MS` — mặc định 2500 req / 15 phút (`900000` ms)
  - Auth: `RATE_LIMIT_AUTH_MAX` / `RATE_LIMIT_AUTH_WINDOW_MS` — mặc định 250 req / 15 phút
  - AI (consultant): `RATE_LIMIT_AI_MAX` / `RATE_LIMIT_AI_WINDOW_MS` — mặc định 75 req / 1 phút (`60000` ms)
- **JWT Authentication**: Token-based auth với `jsonwebtoken`
- **CORS**: Cross-Origin Resource Sharing configuration
- **Gzip Compression**: Nén response tự động
- **Access Logging**: Ghi log truy cập vào SQLite (IP, method, path, response time)
- **Graceful Shutdown**: Đóng database connection an toàn khi shutdown

---

## 🌐 Routes Frontend

| Path | Trang | Mô tả |
|---|---|---|
| `/` | Trang chủ | Form nhập thông tin sinh |
| `/laso` | Lá Số | Hiển thị lá số Bát Tự |
| `/vanhan` | Vận Hạn | Đại Vận & Lưu Niên |
| `/phantich` | Phân Tích | Ma trận phân tích |
| `/dientich` | Điển Tích | Cổ văn luận giải |
| `/tuvan` | Tư Vấn | AI Consultant |
| `/duyenso` | Duyên Số | Hợp duyên 2 người |
| `/xemngay` | Xem Ngày | Xem ngày cá nhân |
| `/chonngay` | Chọn Ngày | Chọn ngày hoàng đạo |
| `/xinque` | Xin Quẻ | Gieo quẻ Kinh Dịch |
| `/lich-su` | Lịch Sử | Lịch sử tư vấn |
| `/bai-viet/:slug` | Bài Viết | Trang bài viết |
| `/admin` | Quản Trị | Admin panel |

---

## 📄 License

MIT License — Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

<p align="center">
  <b>🏮 Viet Lac So</b> — Nền tảng mệnh lý học hiện đại<br/>
  <i>vietlac.com</i>
</p>
