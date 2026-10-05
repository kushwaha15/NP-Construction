import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, Search } from 'lucide-react';
import { API_URL } from '../utils/api';
import PageHeader from '../components/PageHeader';

const PAGE_SIZE = 6;

function PostCard({ post, featured = false }) {
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : post.date || '';

  return (
    <Link to={`/blog/${post.slug}`}
      className={`group block overflow-hidden border border-mist-200 bg-white transition hover:-translate-y-1 hover:shadow-soft ${featured ? 'grid md:grid-cols-2' : ''}`}>
      <div className={featured ? 'min-h-64 overflow-hidden md:min-h-full' : 'aspect-[16/10] overflow-hidden'}>
        {post.cover ? (
          <img
            src={post.cover}
            alt={post.title}
            loading={featured ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/900x560/0B1F3A/F5A623?text=NP+Construction'; }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-navy/5">
            <span className="text-xl font-extrabold text-navy/30">NP Construction</span>
          </div>
        )}
      </div>
      <div className={featured ? 'flex flex-col justify-center p-7 sm:p-10' : 'p-5'}>
        <span className="inline-flex w-fit bg-steel/10 px-3 py-1 text-xs font-bold text-steel">
          {post.category}
        </span>
        <h2 className={`${featured ? 'mt-5 text-2xl sm:text-3xl' : 'mt-4 text-lg'} font-extrabold leading-tight text-navy group-hover:text-steel`}>
          {post.title}
        </h2>
        <p className={`${featured ? 'mt-4 text-base leading-7' : 'mt-3 line-clamp-2 text-sm leading-6'} text-mist-500`}>
          {post.excerpt}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-mist-500">
          <span className="flex items-center gap-1"><Clock3 size={14} className="text-steel" />{post.readTime} min read</span>
          <span className="flex items-center gap-1"><CalendarDays size={14} className="text-steel" />{dateStr}</span>
        </div>
        {featured && (
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-steel">
            Read latest article <ArrowRight size={16} />
          </span>
        )}
      </div>
    </Link>
  );
}

// Skeleton while loading
function SkeletonCard() {
  return (
    <div className="animate-pulse border border-mist-200 bg-white overflow-hidden">
      <div className="aspect-[16/10] bg-mist-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/4 rounded bg-mist-200" />
        <div className="h-5 w-3/4 rounded bg-mist-200" />
        <div className="h-3 w-full rounded bg-mist-200" />
        <div className="h-3 w-2/3 rounded bg-mist-200" />
      </div>
    </div>
  );
}

export default function Blog() {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('All');
  const [page,     setPage]     = useState(1);

  useEffect(() => {
    axios.get(`${API_URL}/api/blog`)
      .then(({ data }) => setPosts(data.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set(posts.map((p) => p.category).filter(Boolean))],
    [posts]
  );

  const latest   = posts[0];
  const filtered = useMemo(() =>
    posts.filter((p) =>
      (category === 'All' || p.category === category) &&
      `${p.title} ${p.excerpt}`.toLowerCase().includes(query.toLowerCase().trim())
    ), [posts, category, query]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateQuery    = (v) => { setQuery(v);    setPage(1); };
  const updateCategory = (v) => { setCategory(v); setPage(1); };

  return (
    <>
      <Helmet>
        <title>Blog | RCC Reinforcement Tips by NP Construction</title>
        <meta name="description" content="Guides and tips on rebar cutting, binding & RCC reinforcement work for builders across Gujarat by NP Construction." />
        <meta property="og:title"       content="Blog | RCC Reinforcement Tips by NP Construction" />
        <meta property="og:description" content="Practical guides on iron cutting, binding & reinforcement for RCC beams, slabs, columns and roofs." />
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="NP Construction" />
      </Helmet>
      <main>
        <PageHeader
          title="Steel work, explained clearly"
          subtitle="Ideas for builders, developers, engineers, and teams planning their next structural steel project."
          breadcrumb={[{ label: 'Blog' }]}
        />

        <section className="section-light py-16 sm:py-20">
          <div className="container-x">

            {/* Latest article hero */}
            {loading ? (
              <div className="animate-pulse border border-mist-200 bg-white grid md:grid-cols-2 overflow-hidden">
                <div className="min-h-64 bg-mist-200" />
                <div className="p-10 space-y-4">
                  <div className="h-3 w-1/4 rounded bg-mist-200" />
                  <div className="h-7 w-3/4 rounded bg-mist-200" />
                  <div className="h-4 w-full rounded bg-mist-200" />
                  <div className="h-4 w-2/3 rounded bg-mist-200" />
                </div>
              </div>
            ) : latest ? (
              <div>
                <p className="mb-5 text-sm font-bold text-steel">Latest article</p>
                <PostCard post={latest} featured />
              </div>
            ) : null}

            {/* Filters */}
            <div className="mt-16 flex flex-col gap-4 border-b border-mist-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((value) => (
                  <button type="button" key={value} onClick={() => updateCategory(value)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold
                      ${category === value ? 'border-steel bg-steel text-white' : 'border-mist-200 text-navy hover:border-steel'}`}>
                    {value}
                  </button>
                ))}
              </div>
              <label className="relative block min-w-64">
                <span className="sr-only">Search articles</span>
                <Search size={17} className="absolute left-3 top-3.5 text-mist-500" />
                <input value={query} onChange={(e) => updateQuery(e.target.value)}
                  className="min-h-11 w-full rounded-lg border border-mist-200 pl-10 pr-3 text-sm outline-none focus:border-steel"
                  placeholder="Search articles" />
              </label>
            </div>

            <div className="mt-10 flex items-center justify-between">
              <p className="text-sm font-semibold text-mist-500">
                {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
              </p>
              {query && (
                <button type="button" onClick={() => updateQuery('')} className="text-sm font-bold text-steel">
                  Clear search
                </button>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
              </div>
            ) : visible.length ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((post) => <PostCard key={post._id || post.slug} post={post} />)}
              </div>
            ) : (
              <div className="border border-dashed border-mist-300 py-20 text-center mt-5">
                <Search className="mx-auto text-mist-300" size={36} />
                <h2 className="mt-4 text-xl font-extrabold text-navy">No articles found</h2>
                <p className="mt-2 text-sm text-mist-500">Try another search or category.</p>
              </div>
            )}

            {/* Pagination */}
            {pageCount > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Blog pagination">
                <button type="button" disabled={page === 1} onClick={() => setPage((v) => v - 1)}
                  className="rounded-lg border border-mist-200 p-2 text-navy disabled:opacity-40" aria-label="Previous page">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-bold text-navy">Page {page} of {pageCount}</span>
                <button type="button" disabled={page === pageCount} onClick={() => setPage((v) => v + 1)}
                  className="rounded-lg border border-mist-200 p-2 text-navy disabled:opacity-40" aria-label="Next page">
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
