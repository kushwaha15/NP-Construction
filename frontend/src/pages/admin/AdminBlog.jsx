import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../../utils/api';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp'];

const EMPTY_FORM = {
  title: '', excerpt: '', category: 'Steel Tips',
  author: 'NP Construction Team', content: '',
};

export default function AdminBlog() {
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [editing,    setEditing]    = useState(null);   // post _id when editing
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);

  // Cover image
  const [coverFile,      setCoverFile]      = useState(null);
  const [coverPreview,   setCoverPreview]   = useState('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress,  setCoverProgress]  = useState(0);
  const [coverError,     setCoverError]     = useState('');
  const [existingCover,  setExistingCover]  = useState(''); // saved URL when editing
  const fileInputRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Load posts from API ────────────────────────────────
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/blog`);
      setPosts(data.data || []);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // ── Reset cover state ──────────────────────────────────
  const resetCover = () => {
    setCoverFile(null);
    setCoverPreview('');
    setCoverUploading(false);
    setCoverProgress(0);
    setCoverError('');
    setExistingCover('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(false);
    resetCover();
  };

  // ── File chosen ────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverError('');
    if (!ALLOWED_TYPES.includes(file.type)) {
      setCoverError('Only JPG, PNG or WEBP images are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setCoverError('File is too large. Maximum size is 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // ── Save (create or update) ────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required'); return;
    }
    setSaving(true);
    setCoverUploading(!!coverFile);
    setCoverProgress(0);

    try {
      const fd = new FormData();
      fd.append('title',    form.title.trim());
      fd.append('excerpt',  form.excerpt.trim());
      fd.append('category', form.category);
      fd.append('author',   form.author.trim());
      fd.append('content',  form.content.trim());
      if (coverFile) fd.append('coverImage', coverFile);

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) =>
          setCoverProgress(Math.round((ev.loaded / ev.total) * 100)),
      };

      if (editing) {
        await axios.patch(`${API_URL}/api/blog/${editing}`, fd, config);
        toast.success('Post updated!');
      } else {
        await axios.post(`${API_URL}/api/blog`, fd, config);
        toast.success('Post published!');
      }

      await loadPosts();
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save post';
      toast.error(msg);
    } finally {
      setSaving(false);
      setCoverUploading(false);
    }
  };

  // ── Edit — load full post content from API ─────────────
  const handleEdit = async (post) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/blog/${post.slug}`);
      const p = data.data;
      setForm({
        title:    p.title,
        excerpt:  p.excerpt   || '',
        category: p.category,
        author:   p.author,
        content:  p.content   || '',
      });
      setEditing(p._id);
      setExistingCover(p.cover || '');
      resetCover();
      setExistingCover(p.cover || ''); // set again after resetCover clears it
      setShowForm(true);
    } catch {
      toast.error('Failed to load post');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/api/blog/${id}`);
      toast.success('Post deleted');
      await loadPosts();
    } catch {
      toast.error('Delete failed');
    }
  };

  const inp = 'w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors font-medium';
  const thumbSrc = coverPreview || existingCover;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-[#0A1628]">Blog Manager</h1>
          <p className="text-gray-400 text-xs mt-0.5">{posts.length} posts</p>
        </div>
        <button
          onClick={() => { if (showForm && !editing) { resetForm(); } else { resetForm(); setShowForm(true); } }}
          className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold
                     px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors">
          <i className={`fas fa-${showForm ? 'times' : 'plus'}`} />
          {showForm ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {/* Editor form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-orange-100">
          <h3 className="font-bold text-[#0A1628] mb-5 flex items-center gap-2">
            <i className="fas fa-pen text-orange-500" />
            {editing ? 'Edit Post' : 'New Blog Post'}
          </h3>
          <div className="space-y-4">

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Title *</label>
              <input type="text" placeholder="Post title" value={form.title}
                onChange={e => set('title', e.target.value)} className={inp} />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Excerpt</label>
              <textarea placeholder="Short description shown in blog listing…" value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)} rows={2} className={`${inp} resize-none`} />
            </div>

            {/* Category + Author */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className={inp}>
                  <option>Steel Tips</option>
                  <option>Industry News</option>
                  <option>Projects</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Author</label>
                <input type="text" value={form.author} onChange={e => set('author', e.target.value)} className={inp} />
              </div>
            </div>

            {/* Cover photo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Cover Photo <span className="text-gray-300 font-normal normal-case">(optional)</span>
              </label>
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {thumbSrc ? (
                  <div className="relative shrink-0">
                    <img src={thumbSrc} alt="Cover preview"
                      className="h-20 w-28 object-cover rounded-xl border-2 border-gray-200"
                      onError={e => { e.currentTarget.style.opacity = '0.3'; }} />
                    <button type="button"
                      onClick={() => { resetCover(); }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600
                                 text-white rounded-full text-xs flex items-center justify-center"
                      title="Remove photo">×</button>
                  </div>
                ) : (
                  <div className="h-20 w-28 shrink-0 rounded-xl border-2 border-dashed border-gray-200
                                  flex items-center justify-center bg-gray-50">
                    <i className="fas fa-image text-2xl text-gray-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <input ref={fileInputRef} type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden" onChange={handleFileChange} />
                  <button type="button" disabled={saving}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 bg-[#0A1628] hover:bg-[#17345C]
                               disabled:opacity-60 text-white text-sm font-bold
                               px-4 py-2.5 rounded-xl transition-colors">
                    <i className="fas fa-camera" />
                    {thumbSrc ? 'Change Photo' : 'Choose Photo'}
                  </button>

                  {/* Upload progress */}
                  {coverUploading && (
                    <div className="mt-2.5">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading…</span><span>{coverProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${coverProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {coverFile && !coverUploading && (
                    <p className="mt-1.5 text-xs text-gray-500 truncate">
                      <i className="fas fa-check-circle text-green-500 mr-1" />
                      {coverFile.name}
                    </p>
                  )}
                  {coverError && (
                    <p className="mt-1.5 text-xs text-red-500">
                      <i className="fas fa-exclamation-circle mr-1" />{coverError}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">
                    JPG, PNG or WEBP · Max 10 MB. Photo uploads to Cloudinary automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Content + live preview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Content * <span className="text-gray-300 normal-case font-normal">(supports Markdown)</span>
              </label>
              <div className="grid gap-4 lg:grid-cols-2">
                <textarea
                  placeholder={`## Heading\n**Bold text**\n- List item`}
                  value={form.content} onChange={e => set('content', e.target.value)}
                  rows={16} className={`${inp} resize-y font-mono text-xs leading-relaxed`} />
                <div className="min-h-[16rem] border-2 border-gray-100 bg-gray-50 p-4 text-sm leading-7 text-gray-600">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Live preview</p>
                  {form.content
                    ? <ReactMarkdown>{form.content}</ReactMarkdown>
                    : <p className="text-gray-400">Your formatted post will appear here.</p>}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                <i className="fas fa-info-circle mr-1" />
                Word count: {form.content.split(/\s+/).filter(Boolean).length} words ·
                Est. read time: {Math.max(1, Math.ceil(form.content.split(/\s+/).filter(Boolean).length / 200))} min
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button onClick={handleSave} disabled={saving}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold
                           px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
                <i className="fas fa-save" />
                {saving ? 'Saving…' : editing ? 'Update Post' : 'Publish Post'}
              </button>
              <button onClick={resetForm}
                className="border-2 border-gray-200 hover:border-gray-300 text-gray-500
                           font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-3">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
            <i className="fas fa-file-alt text-4xl mb-3 block" />
            <p>No posts yet. Click "New Post" to get started.</p>
          </div>
        )}
        {posts.map(post => (
          <div key={post._id}
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            {post.cover ? (
              <img src={post.cover} alt={post.title}
                className="w-16 h-16 object-cover rounded-xl shrink-0"
                onError={e => { e.currentTarget.src = 'https://placehold.co/64x64/0A1628/E07B39?text=NP'; }} />
            ) : (
              <div className="w-16 h-16 rounded-xl shrink-0 bg-[#0A1628]/10 flex items-center justify-center">
                <i className="fas fa-image text-gray-300 text-xl" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {post.category}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-gray-400 text-xs">{post.readTime} min read</span>
              </div>
              <h4 className="font-bold text-[#0A1628] text-sm truncate">{post.title}</h4>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{post.excerpt}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener"
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg
                           flex items-center justify-center text-xs transition-colors" title="Preview">
                <i className="fas fa-eye" />
              </a>
              <button onClick={() => handleEdit(post)}
                className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-lg
                           flex items-center justify-center text-xs transition-colors" title="Edit">
                <i className="fas fa-pen" />
              </button>
              <button onClick={() => handleDelete(post._id)}
                className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-400 rounded-lg
                           flex items-center justify-center text-xs transition-colors" title="Delete">
                <i className="fas fa-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
