/* ── DB Layer: Supabase + localStorage fallback ── */

let _supabase = null;

/** Khởi tạo Supabase client nếu có key hợp lệ */
function initSupabase() {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return;
  try {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn('[db] Supabase init failed:', e);
  }
}

/** Kiểm tra có Supabase hay không */
function hasSupabase() { return !!_supabase; }

// ── LocalStorage helpers ──

function lsGetEntries() {
  try { return JSON.parse(localStorage.getItem(LS_ENTRIES) || '[]'); }
  catch { return []; }
}
function lsSaveEntries(arr) {
  localStorage.setItem(LS_ENTRIES, JSON.stringify(arr));
}
function lsGetMyIds() {
  try { return JSON.parse(localStorage.getItem(LS_MY_IDS) || '[]'); }
  catch { return []; }
}
function lsAddMyId(id) {
  const ids = lsGetMyIds();
  if (!ids.includes(id)) { ids.push(id); localStorage.setItem(LS_MY_IDS, JSON.stringify(ids)); }
}
function lsRemoveMyId(id) {
  const ids = lsGetMyIds().filter(x => x !== id);
  localStorage.setItem(LS_MY_IDS, JSON.stringify(ids));
}
function isMyEntry(id) { return lsGetMyIds().includes(id); }

// Tạo UUID đơn giản (fallback khi không có Supabase)
function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ── CRUD ──

/**
 * Lưu entry mới.
 * @param {Object} data - { name, role, role_group, year, milestone, thank_you, avatar_color }
 * @returns {Object} entry đã lưu (với id và created_at)
 */
async function saveEntry(data) {
  const entry = {
    ...data,
    id:         genUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (hasSupabase()) {
    const { data: rows, error } = await _supabase
      .from('hall_of_fame_entries')
      .insert([entry])
      .select()
      .single();
    if (error) throw error;
    lsAddMyId(rows.id);
    // Sync to localStorage fallback
    const local = lsGetEntries();
    lsSaveEntries([rows, ...local]);
    return rows;
  } else {
    // Fallback: chỉ dùng localStorage
    const local = lsGetEntries();
    lsSaveEntries([entry, ...local]);
    lsAddMyId(entry.id);
    return entry;
  }
}

/**
 * Tải danh sách entries với filter/sort/pagination.
 * @param {Object} opts - { group, sort, search, page, pageSize }
 * @returns {{ entries: Array, total: number }}
 */
async function loadEntries({ group = 'all', sort = 'newest', search = '', page = 0, pageSize = PAGE_SIZE } = {}) {
  if (hasSupabase()) {
    let query = _supabase.from('hall_of_fame_entries').select('*', { count: 'exact' });
    if (group !== 'all') query = query.eq('role_group', group);
    if (search.trim()) query = query.ilike('name', `%${search.trim()}%`);
    switch (sort) {
      case 'oldest': query = query.order('created_at', { ascending: true }); break;
      case 'name':   query = query.order('name', { ascending: true }); break;
      case 'year':   query = query.order('year', { ascending: true }); break;
      default:       query = query.order('created_at', { ascending: false });
    }
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);
    const { data: rows, count, error } = await query;
    if (error) throw error;
    return { entries: rows || [], total: count || 0 };
  } else {
    // Fallback localStorage
    let entries = lsGetEntries();
    if (group !== 'all') entries = entries.filter(e => e.role_group === group);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      entries = entries.filter(e => e.name.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'oldest': entries.sort((a,b) => a.created_at.localeCompare(b.created_at)); break;
      case 'name':   entries.sort((a,b) => a.name.localeCompare(b.name)); break;
      case 'year':   entries.sort((a,b) => a.year - b.year); break;
      default:       entries.sort((a,b) => b.created_at.localeCompare(a.created_at));
    }
    const total = entries.length;
    entries = entries.slice(page * pageSize, (page + 1) * pageSize);
    return { entries, total };
  }
}

/**
 * Lấy tổng số entries (cho Stats bar)
 * @returns {number}
 */
async function countEntries() {
  if (hasSupabase()) {
    const { count } = await _supabase
      .from('hall_of_fame_entries')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }
  return lsGetEntries().length;
}

/**
 * Cập nhật entry.
 * @param {string} id
 * @param {Object} data
 * @returns {Object} entry đã cập nhật
 */
async function updateEntry(id, data) {
  const updated = { ...data, updated_at: new Date().toISOString() };
  if (hasSupabase()) {
    const { data: rows, error } = await _supabase
      .from('hall_of_fame_entries')
      .update(updated)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    // Sync localStorage
    const local = lsGetEntries().map(e => e.id === id ? { ...e, ...updated } : e);
    lsSaveEntries(local);
    return rows;
  } else {
    const local = lsGetEntries().map(e => e.id === id ? { ...e, ...updated, id } : e);
    lsSaveEntries(local);
    return local.find(e => e.id === id);
  }
}

/**
 * Xóa entry.
 * @param {string} id
 */
async function deleteEntry(id) {
  if (hasSupabase()) {
    const { error } = await _supabase.from('hall_of_fame_entries').delete().eq('id', id);
    if (error) throw error;
  }
  const local = lsGetEntries().filter(e => e.id !== id);
  lsSaveEntries(local);
  lsRemoveMyId(id);
}
