import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Copy, MessageCircle } from 'lucide-react';
import { API_URL } from '../utils/api';

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}
function getHeadings(content) {
  return content.split('\n').map((line) => {
    const match = line.match(/^(##|###)\s+(.+)$/);
    return match ? { level: match[1].length, text: match[2].replace(/[*_`]/g, ''), id: slugify(match[2]) } : null;
  }).filter(Boolean);
}

const markdownComponents = {
  h2: ({ children }) => <h2 id={slugify(String(children))} className="mt-12 scroll-mt-28 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(String(children))} className="mt-8 scroll-mt-28 text-xl font-extrabold text-navy">{children}</h3>,
  p:  ({ children }) => <p className="mt-5 leading-[1.7] text-mist-500">{children}</p>,
  ul: ({ children }) => <ul className="mt-5 list-disc space-y-2 pl-6 leading-[1.7] text-mist-500">{children}</ul>,
  ol: ({ children }) => <ol className="mt-5 list-decimal space-y-2 pl-6 leading-[1.7] text-mist-500">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => <blockquote className="my-8 border-l-4 border-amber bg-amber/10 px-6 py-4 text-lg italic leading-[1.7] text-navy">{children}</blockquote>,
  table: ({ children }) => <div className="mt-6 overflow-x-auto"><table className="w-full border-collapse border border-mist-200 text-left text-sm">{children}</table></div>,
  th: ({ children }) => <th className="border border-mist-200 bg-mist p-3 font-bold text-navy">{children}</th>,
  td: ({ children }) => <td className="border border-mist-200 p-3 text-mist-500">{children}</td>,
  code: ({ inline, children }) => inline
    ? <code className="rounded bg-mist px-1.5 py-0.5 text-sm text-steel">{children}</code>
    : <pre className="mt-6 overflow-x-auto rounded-lg bg-navy p-5 text-sm leading-6 text-white"><code>{children}</code></pre>,
  a: ({ href, children }) => <a href={href} className="font-semibold text-steel underline decoration-steel/30 underline-offset-4 hover:decoration-steel">{children}</a>,
};

function SkeletonPost() {
  return (
    <main>
      <header className="section-mist border-b border-mist-200 py-20 sm:py-24">
        <div className="container-x max-w-4xl space-y-4 animate-pulse">
          <div className="h-4 w-24 rounded bg-mist-200" />
          <div className="h-10 w-3/4 rounded bg-mist-200" />
          <div className="h-4 w-1/3 rounded bg-mist-200" />
        </div>
      </header>
      <section className="section-light py-14">
        <div className="container-x max-w-[720px] mx-auto animate-pulse space-y-4">
          <div className="aspect-[16/9] w-full rounded bg-mist-200" />
          <div className="h-4 w-full rounded bg-mist-200" />
          <div className="h-4 w-5/6 rounded bg-mist-200" />
          <div className="h-4 w-4/6 rounded bg-mist-200" />
        </div>
      </section>
    </main>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post,         setPost]         = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);
  const [copied,       setCopied]       = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    axios.get(`${API_URL}/api/blog/${slug}`)
      .then(({ data }) => {
        setPost(data.data);
        // Load other posts for "related" section
        return axios.get(`${API_URL}/api/blog`);
      })
      .then(({ data }) => {
        setRelatedPosts((data.data || []).filter((p) => p.slug !== slug).slice(0, 3));
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const headings = useMemo(() => (post?.content ? getHeadings(post.content) : []), [post]);

  if (loading) return <SkeletonPost />;

  if (notFound || !post) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-24 text-center">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Article not found</h1>
          <Link to="/blog" className="mt-4 inline-flex items-center gap-2 font-bold text-steel">
            <ArrowLeft size={16} /> Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/blog/${slug}`;
  const dateStr  = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : post.date || '';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline:    post.title,
    description: post.excerpt,
    image:       post.cover || '',
    datePublished: post.publishedAt || '',
    author:      { '@type': 'Organization', name: post.author },
    publisher:   { '@type': 'Organization', name: 'NP Construction' },
    mainEntityOfPage: shareUrl,
  };

  const copyLink = async () => {
    await navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | NP Construction Blog</title>
        <meta name="description" content={post.excerpt ? post.excerpt.slice(0, 155) : `Read this article by NP Construction on RCC reinforcement and iron cutting & binding work in Gujarat.`} />
        <meta property="og:type"        content="article" />
        <meta property="og:title"       content={`${post.title} | NP Construction`} />
        <meta property="og:description" content={post.excerpt ? post.excerpt.slice(0, 155) : 'RCC reinforcement article by NP Construction.'} />
        {post.cover && <meta property="og:image" content={post.cover} />}
        <meta property="og:url"         content={shareUrl} />
        <meta property="og:site_name"   content="NP Construction" />
        <meta name="author"             content={post.author || 'NP Construction Team'} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>
      <main>
        {/* Article header */}
        <header className="section-mist border-b border-mist-200 py-20 sm:py-24">
          <div className="container-x max-w-4xl">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-steel">
              <ArrowLeft size={16} /> Back to blog
            </Link>
            <span className="mt-8 block w-fit bg-steel/10 px-3 py-1 text-xs font-bold text-steel">
              {post.category}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-semibold text-mist-500">
              <span>{post.author}</span>
              <span className="flex items-center gap-1"><CalendarDays size={15} className="text-steel" />{dateStr}</span>
              <span className="flex items-center gap-1"><Clock3 size={15} className="text-steel" />{post.readTime} min read</span>
            </div>
          </div>
        </header>

        {/* Article body */}
        <section className="section-light py-14 sm:py-20">
          <div className={`container-x ${headings.length > 0 ? 'grid gap-12 lg:grid-cols-[180px_720px] lg:justify-center' : 'flex justify-center'}`}>
            {/* Table of contents */}
            {headings.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-28 border-l-2 border-mist-200 pl-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-mist-500">On this page</p>
                  <nav className="mt-4 space-y-3">
                    {headings.map((heading) => (
                      <a key={heading.id} href={`#${heading.id}`}
                        className={`block text-sm leading-5 text-mist-500 hover:text-steel ${heading.level === 3 ? 'pl-3 text-xs' : 'font-bold'}`}>
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            {/* Content */}
            <article className={`min-w-0 text-[18px] ${headings.length > 0 ? 'max-w-[720px]' : 'w-full max-w-[720px]'}`}>
              {/* Cover image */}
              {post.cover ? (
                <img
                  src={post.cover}
                  alt={post.title}
                  className="mb-10 aspect-[16/9] w-full object-cover"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/1000x560/0B1F3A/F5A623?text=NP+Construction'; }}
                />
              ) : (
                <div className="mb-10 aspect-[16/9] w-full flex items-center justify-center bg-navy/5 border border-mist-200">
                  <span className="text-2xl font-extrabold text-navy/20">NP Construction</span>
                </div>
              )}

              <ReactMarkdown components={markdownComponents}>{post.content}</ReactMarkdown>

              {/* Share buttons */}
              <div className="mt-14 border-t border-mist-200 pt-8">
                <p className="text-sm font-bold uppercase tracking-wider text-mist-500">Share this article</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`}
                    target="_blank" rel="noreferrer" className="btn-amber">
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                  <button type="button" onClick={copyLink} className="btn-navy">
                    <Copy size={16} /> {copied ? 'Link copied' : 'Copy link'}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="section-mist py-16">
            <div className="container-x">
              <p className="text-sm font-bold text-steel">Keep reading</p>
              <h2 className="mt-3 text-3xl font-extrabold text-navy">Related posts</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {relatedPosts.map((item) => (
                  <Link key={item._id || item.slug} to={`/blog/${item.slug}`}
                    className="group bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-steel">{item.category}</p>
                    <h3 className="mt-3 font-extrabold leading-6 text-navy group-hover:text-steel">{item.title}</h3>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-steel">
                      Read post <ArrowRight size={15} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="section-light py-14">
          <div className="container-x flex flex-col items-start justify-between gap-5 border border-mist-200 bg-mist p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-sm font-bold text-steel">Putting this into practice?</p>
              <h2 className="mt-2 text-2xl font-extrabold text-navy">Need a quote for your steel project?</h2>
              <p className="mt-2 text-sm text-mist-500">Share your drawings and project details with the NP Construction team.</p>
            </div>
            <Link to="/contact" className="btn-steel">Need a quote? <ArrowRight size={17} /></Link>
          </div>
        </section>
      </main>
    </>
  );
}
