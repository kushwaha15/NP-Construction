import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Beam Reinforcement', 'Slab Reinforcement', 'Column Reinforcement', 'Roof Reinforcement', 'Other'];
const CITIES_LIST = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Other'];
const ACCEPT     = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska';

// ── Upload form ────────────────────────────────────────────
function UploadForm({ onUploaded }) {
  const [form, setForm]         = useState({ title:'', description:'', category:'Beam Reinforcement', tonnage:'', city:'' });
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState('');
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview({ url, type: f.type.startsWith('video/') ? 'video' : 'image' });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setError(''); setUploading(true); setProgress(0);

    const fd = new FormData();
    if (file) fd.append('file', file);   // optional — only append when chosen
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('category', form.category);
    fd.append('tonnage', form.tonnage || '0');
    fd.append('city', form.city.trim());

    try {
      await axios.post(`${API_URL}/api/portfolio`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          setProgress(Math.round((ev.loaded / ev.total) * 100));
        },
      });
      toast.success('Uploaded successfully!');
      setForm({ title:'', description:'', category:'Beam Reinforcement', tonnage:'', city:'' });
      setFile(null); setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      onUploaded();
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed';
      setError(msg);
      toast.error(msg);
    } finally { setUploading(false); setProgress(0); }
  };

  const inputCls = 'w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors font-medium bg-gray-50 focus:bg-white';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <h3 className="font-bold text-[#0A1628] mb-5 flex items-center gap-2">
        <i className="fas fa-cloud-upload-alt text-orange-500" /> Upload New Work
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Title <span className="text-orange-500">*</span>
            </label>
            <input type="text" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
              placeholder="e.g. Steel Framework – Ahmedabad Warehouse" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} className={inputCls}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Description <span className="text-gray-300 font-normal normal-case">(optional)</span>
            </label>
            <input type="text" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
              placeholder="Brief description…" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              City <span className="text-gray-300 font-normal normal-case">(optional)</span>
            </label>
            <select value={form.city} onChange={e => setForm(f=>({...f,city:e.target.value}))} className={inputCls}>
              <option value="">— Select city —</option>
              {CITIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Tonnage (tonnes) <span className="text-gray-300 font-normal normal-case">(optional)</span>
            </label>
            <input type="number" min="0" step="0.1" value={form.tonnage}
              onChange={e => setForm(f=>({...f,tonnage:e.target.value}))}
              placeholder="e.g. 120" className={inputCls} />
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors mb-4
            ${preview ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200 hover:border-orange-300 bg-gray-50'}`}>

          {preview ? (
            <div className="flex items-center gap-4">
              {preview.type === 'image' ? (
                <img src={preview.url} alt="preview" className="w-24 h-16 object-cover rounded-lg shrink-0" />
              ) : (
                <video src={preview.url} className="w-24 h-16 object-cover rounded-lg shrink-0" muted />
              )}
              <div className="text-left">
                <p className="font-semibold text-[#0A1628] text-sm">{file.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB · {preview.type}</p>
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  className="text-red-400 hover:text-red-600 text-xs mt-1 font-medium">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt text-3xl text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Drag & drop or click to browse <span className="text-gray-400 font-normal">(optional)</span></p>
              <p className="text-xs text-gray-400 mt-1">Images: JPG, PNG, WEBP · Videos: MP4, MOV, AVI, WEBM · Max 150MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept={ACCEPT} className="hidden"
          onChange={e => handleFile(e.target.files[0])} />

        {/* Progress bar */}
        {uploading && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{file ? 'Uploading to Cloudinary…' : 'Saving…'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={uploading}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold
                     py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
          {uploading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
            : <><i className="fas fa-plus" /> Save Project</>}
        </button>
      </form>
    </div>
  );
}

// ── Edit modal ─────────────────────────────────────────────
function EditModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({ title: item.title, description: item.description, category: item.category, tonnage: item.tonnage ?? '', city: item.city ?? '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API_URL}/api/portfolio/${item._id}`, form);
      toast.success('Updated!');
      onSaved();
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-[#0A1628]">Edit Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="space-y-3">
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
            placeholder="Title" className={inputCls} />
          <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
            placeholder="Description" className={inputCls} />
          <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className={inputCls}>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} className={inputCls}>
            <option value="">— Select city —</option>
            {CITIES_LIST.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" min="0" step="0.1" value={form.tonnage}
            onChange={e=>setForm(f=>({...f,tonnage:e.target.value}))}
            placeholder="Tonnage (tonnes)" className={inputCls} />
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={save} disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={onClose} className="px-5 border-2 border-gray-200 hover:border-gray-300 text-gray-500 font-bold rounded-xl">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function AdminPortfolio() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'All' ? { category: filter } : {};
      const { data } = await axios.get(`${API_URL}/api/portfolio`, { params });
      setItems(data.data || []);
    } catch { toast.error('Failed to load portfolio'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await axios.delete(`${API_URL}/api/portfolio/${id}`);
      toast.success('Deleted');
      load();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const FILTER_OPTIONS = ['All', ...CATEGORIES];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-black text-[#0A1628]">Portfolio / Work</h1>
        <span className="text-sm text-gray-400">{items.length} items</span>
      </div>

      <UploadForm onUploaded={load} />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_OPTIONS.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full font-semibold text-xs border-2 transition-all
              ${filter === cat
                ? 'bg-[#0A1628] border-[#0A1628] text-white'
                : 'border-gray-200 text-gray-500 hover:border-[#0A1628] hover:text-[#0A1628]'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <i className="fas fa-photo-video text-4xl text-gray-200 mb-3 block" />
          <p className="text-gray-400 font-semibold">No items yet. Upload something above.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map(item => (
            <div key={item._id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={item.mediaType === 'video'
                    ? (item.thumbnailUrl || `https://res.cloudinary.com/${window.__CLOUDINARY_CLOUD__}/video/upload/so_2,w_400,h_250,c_fill,f_jpg/${item.cloudinaryPublicId}.jpg`)
                    : item.cloudinaryUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.src='https://placehold.co/400x250/0A1628/E07B39?text=NP'; }}
                />
                {item.mediaType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-orange-500/80 rounded-full flex items-center justify-center">
                      <i className="fas fa-play text-white text-sm ml-0.5" />
                    </div>
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-[#0A1628]/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {item.mediaType}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#0A1628] text-sm truncate">{item.title}</h4>
                    <span className="text-xs text-orange-500 font-semibold">{item.category}</span>
                    {item.city && <span className="ml-2 text-xs text-gray-400">{item.city}</span>}
                    {item.tonnage > 0 && <p className="text-xs text-gray-400 mt-0.5">{item.tonnage} tonnes</p>}
                    {item.description && (
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditing(item)}
                    className="flex-1 bg-gray-100 hover:bg-[#0A1628] hover:text-white text-gray-600 text-xs font-bold
                               py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                    <i className="fas fa-pen" /> Edit
                  </button>
                  <button onClick={() => deleteItem(item._id)} disabled={deleting === item._id}
                    className="flex-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold
                               py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-red-200 hover:border-red-500 disabled:opacity-60">
                    {deleting === item._id
                      ? <i className="fas fa-spinner fa-spin" />
                      : <><i className="fas fa-trash-alt" /> Delete</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <EditModal
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
