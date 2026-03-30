# VHEC 10 Years — Đại sảnh Danh vọng & Bức tường Tri ân

Website kỷ niệm 10 năm thành lập công ty IT **VHEC** (2016–2026), nơi mỗi thành viên có thể để lại dấu ấn cá nhân, chia sẻ kỷ niệm đáng nhớ và gửi lời tri ân đến đồng đội.

---

## Tính năng

- **Hall of Fame Card** — Tạo card cá nhân với avatar, milestone, lời cảm ơn; hỗ trợ download PNG và chia sẻ
- **Bức tường Tri ân** — Grid hiển thị tất cả thành viên, lọc theo nhóm vai trò, tìm kiếm, sắp xếp; infinite scroll
- **Đa ngôn ngữ** — Tiếng Việt / Tiếng Nhật, chuyển đổi realtime
- **Nhạc nền** — Tự động phát khi có tương tác, nút bật/tắt
- **Hiệu ứng** — Star particles, 5 preset confetti, count-up animation, countdown tới ngày kỷ niệm
- **Responsive** — Desktop, tablet, mobile
- **Offline fallback** — LocalStorage khi Supabase chưa cấu hình

---

## Cấu trúc dự án

```
hall-of-fame/
├── index.html              # Single-page HTML shell
├── vercel.json             # Cấu hình deploy Vercel
├── css/
│   ├── main.css            # CSS variables, reset, topbar, modal, footer
│   ├── animations.css      # Tất cả @keyframes
│   ├── hero.css            # Hero section + Stats bar
│   ├── form.css            # Form nhập liệu + HOF actions
│   ├── card.css            # Hall of Fame card
│   └── wall.css            # Bức tường Tri ân, filter, mini-card, skeleton
├── js/
│   ├── config.js           # Supabase keys, constants, role map, màu sắc
│   ├── i18n.js             # Đa ngôn ngữ: loadLang(), applyLang(), t()
│   ├── db.js               # CRUD: saveEntry(), loadEntries(), update, delete
│   ├── effects.js          # Particles, confetti (5 preset), countUp, toast, countdown
│   ├── render.js           # renderHallOfFameCard(), renderThankYouWall(), modal
│   ├── share.js            # downloadCard() (html2canvas), shareEntry()
│   └── main.js             # Init, event listeners, validation
├── locales/
│   ├── vi.json             # Bản dịch tiếng Việt
│   └── ja.json             # Bản dịch tiếng Nhật
└── assets/
    ├── audio/              # Nhạc nền (bg-music.mp3)
    └── sprites/            # SVG icons
```

---

## Cài đặt & Chạy thử

### Yêu cầu
- Trình duyệt hiện đại (Chrome 105+, Firefox 121+, Safari 15.4+)
- Một local server (không mở `file://` trực tiếp — fetch API sẽ bị block)

### Chạy local

```bash
# Node.js
npx serve .

# Python
python -m http.server 3000

# VS Code: dùng Live Server extension
```

Mở trình duyệt tại `http://localhost:3000`

---

## Cấu hình Supabase

### 1. Tạo bảng trong Supabase SQL Editor

```sql
create table hall_of_fame_entries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          text not null,
  role_group    text not null,
  year          integer not null check (year between 2016 and 2026),
  milestone     text not null,
  thank_you     text,
  avatar_color  text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Row Level Security
alter table hall_of_fame_entries enable row level security;

create policy "public read"   on hall_of_fame_entries for select using (true);
create policy "public insert" on hall_of_fame_entries for insert with check (true);
create policy "public update" on hall_of_fame_entries for update using (true);
create policy "public delete" on hall_of_fame_entries for delete using (true);
```

### 2. Điền credentials vào `js/config.js`

```js
const SUPABASE_URL      = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

> Nếu để placeholder, website vẫn hoạt động với localStorage làm fallback.

---

## Tùy chỉnh nội dung

Tất cả thông số có thể chỉnh trong `js/config.js`:

```js
const ANNIVERSARY_DATE = new Date('2026-05-16T00:00:00'); // Ngày kỷ niệm
const STATS = { projects: 200, customers: 50 };           // Số liệu Stats bar
```

Toàn bộ text UI chỉnh trong `locales/vi.json` (Việt) và `locales/ja.json` (Nhật).

---

## Deploy lên Vercel

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Hoặc kéo thả thư mục vào [vercel.com/new](https://vercel.com/new) — không cần build step vì là static site.

---

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Frontend | Vanilla JS + CSS (không framework) |
| Database | Supabase (PostgreSQL) |
| Ảnh card | html2canvas (CDN) |
| Font | Inter, Space Grotesk, JetBrains Mono (Google Fonts) |
| Deploy | Vercel |

---

## Màu sắc theo nhóm vai trò

| Nhóm | Màu | Vai trò |
|---|---|---|
| ⚡ Kỹ thuật | `#00d4ff` (cyan) | Frontend, Backend, Fullstack, Mobile, DevOps, Data, QA |
| 🎨 Thiết kế / Sản phẩm | `#a855f7` (purple) | UI/UX, Product, Project Manager, BA, Scrum Master |
| 🏢 Vận hành / Hỗ trợ | `#f59e0b` (gold) | Hành chính, HR, Kế toán, Office, Marketing, Sales |

---

*Được xây dựng với 💙 bởi chính những người VHEC — 2016–2026*
