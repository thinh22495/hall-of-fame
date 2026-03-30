/* ── VHEC Hall of Fame – Config ── */

// Supabase credentials (điền key thật vào đây sau khi có project)
const SUPABASE_URL      = 'https://ghovwqqfylnmexcklyow.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pXK22okF7JnBuuXDKEqEXQ_5yzaFJpT';

// Ngày kỷ niệm
const ANNIVERSARY_DATE = new Date('2026-05-16T00:00:00');

// Stats cứng
const STATS = {
  projects:  200,
  customers: 50,
};

// Ánh xạ vai trò → nhóm
const ROLE_GROUP_MAP = {
  'Frontend Developer':  'tech',
  'Backend Developer':   'tech',
  'Fullstack Developer': 'tech',
  'Mobile Developer':    'tech',
  'DevOps Engineer':     'tech',
  'Data Engineer':       'tech',
  'QA Engineer':         'tech',
  'UI/UX Designer':      'design',
  'Product Manager':     'design',
  'Project Manager':     'design',
  'Business Analyst':    'design',
  'Scrum Master':        'design',
  'Hành chính':          'ops',
  'Nhân sự (HR)':        'ops',
  'Kế toán':             'ops',
  'Office Manager':      'ops',
  'Marketing':           'ops',
  'Sales':               'ops',
};

// Màu glow theo nhóm
const GROUP_COLOR = {
  tech:   '#00d4ff',
  design: '#a855f7',
  ops:    '#f59e0b',
};

// RGB của các màu nhóm (cho rgba() trong CSS)
const GROUP_COLOR_RGB = {
  tech:   '0,212,255',
  design: '168,85,247',
  ops:    '245,158,11',
};

// Ánh xạ màu hex → RGB string
const HEX_RGB_MAP = {
  '#00d4ff': '0,212,255',
  '#a855f7': '168,85,247',
  '#f59e0b': '245,158,11',
  '#22c55e': '34,197,94',
  '#f43f5e': '244,63,94',
  '#fb923c': '251,146,60',
};

// Preset hiệu ứng confetti (random mỗi lần)
const CONFETTI_PRESETS = ['confetti', 'fireworks', 'sparkle', 'neon-burst'];

// LocalStorage keys
const LS_ENTRIES = 'vhec_wall_of_fame_entries';   // fallback full data
const LS_MY_IDS  = 'vhec_my_entry_ids';           // UUIDs của máy này

// Số card load mỗi lần (infinite scroll)
const PAGE_SIZE = 12;

// Năm hợp lệ
const YEAR_MIN = 2016;
const YEAR_MAX = 2026;
