import { supabase, isConfigured } from '../lib/supabase';

const KEY         = 'resurgo-saved-props';
const NOTES_KEY   = 'resurgo-saved-notes';
const FOLDERS_KEY = 'resurgo-saved-folders';
const FMAP_KEY    = 'resurgo-saved-folder-map';

// Module-level user id — set by GlobalContext on login
let _userId = null;
export function setSavedPropsUser(id) { _userId = id; }

const lsGet = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
};

// ── Saved IDs ─────────────────────────────────────────────────────────────────
export const getSavedIds = () => lsGet(KEY, []);
export const isSavedProp = (id) => getSavedIds().includes(String(id));

export const toggleSavedProp = (id) => {
  const strId = String(id);
  const ids   = getSavedIds();
  const was   = ids.includes(strId);
  const next  = was ? ids.filter(i => i !== strId) : [...ids, strId];
  localStorage.setItem(KEY, JSON.stringify(next));

  if (was) {
    // Also clean up note and folder assignment
    const notes = lsGet(NOTES_KEY, {});
    delete notes[strId];
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    const fmap = lsGet(FMAP_KEY, {});
    delete fmap[strId];
    localStorage.setItem(FMAP_KEY, JSON.stringify(fmap));
  }

  if (isConfigured && _userId) {
    if (was) {
      supabase.from('saved_properties')
        .delete().eq('user_id', _userId).eq('property_id', strId).catch(() => {});
    } else {
      supabase.from('saved_properties')
        .insert({ user_id: _userId, property_id: strId }).catch(() => {});
    }
  }

  return { ids: next, added: !was };
};

// ── Notes ─────────────────────────────────────────────────────────────────────
export const getSavedNotes = () => lsGet(NOTES_KEY, {});

export const setSavedNote = (propId, note) => {
  const notes = getSavedNotes();
  if (note.trim()) notes[String(propId)] = note.trim();
  else delete notes[String(propId)];
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));

  if (isConfigured && _userId) {
    supabase.from('saved_properties')
      .update({ note: note.trim() || null })
      .eq('user_id', _userId).eq('property_id', String(propId)).catch(() => {});
  }
};

// ── Folders ───────────────────────────────────────────────────────────────────
export const getSavedFolders  = () => lsGet(FOLDERS_KEY, []);
export const getSavedFolderMap = () => lsGet(FMAP_KEY, {});

export const addSavedFolder = (name) => {
  const folders = getSavedFolders();
  const trimmed = name.trim();
  if (!trimmed || folders.includes(trimmed)) return folders;
  const next = [...folders, trimmed];
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(next));
  return next;
};

export const deleteSavedFolder = (name) => {
  const folders = getSavedFolders().filter(f => f !== name);
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  // Unassign all properties in that folder
  const fmap = getSavedFolderMap();
  Object.keys(fmap).forEach(k => { if (fmap[k] === name) delete fmap[k]; });
  localStorage.setItem(FMAP_KEY, JSON.stringify(fmap));
  return folders;
};

export const assignFolder = (propId, folderName) => {
  const fmap = getSavedFolderMap();
  if (folderName) fmap[String(propId)] = folderName;
  else delete fmap[String(propId)];
  localStorage.setItem(FMAP_KEY, JSON.stringify(fmap));

  if (isConfigured && _userId) {
    supabase.from('saved_properties')
      .update({ folder_name: folderName || null })
      .eq('user_id', _userId).eq('property_id', String(propId)).catch(() => {});
  }
};

// ── Supabase hydration on login ───────────────────────────────────────────────
export const loadSavedFromSupabase = async (userId) => {
  if (!isConfigured || !userId) return;
  try {
    const { data } = await supabase
      .from('saved_properties')
      .select('property_id, note, folder_name')
      .eq('user_id', userId);
    if (data?.length) {
      localStorage.setItem(KEY, JSON.stringify(data.map(r => r.property_id)));
      const notes = {};
      const fmap  = {};
      const folderSet = new Set(lsGet(FOLDERS_KEY, []));
      data.forEach(r => {
        if (r.note)        notes[r.property_id] = r.note;
        if (r.folder_name) { fmap[r.property_id] = r.folder_name; folderSet.add(r.folder_name); }
      });
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      localStorage.setItem(FMAP_KEY,  JSON.stringify(fmap));
      localStorage.setItem(FOLDERS_KEY, JSON.stringify([...folderSet]));
    }
  } catch { /* silent */ }
};
