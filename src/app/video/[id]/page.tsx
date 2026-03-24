"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Simple diff helper to highlight additions for versions
function HighlightDiff({ oldText, newText }: { oldText: string, newText: string }) {
  // Real diffing is complex, so we will just show the text for MVP
  // But we can highlight changed areas if we built a proper diff engine
  return (
    <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px', margin: '1rem 0', background: 'var(--bg-primary)', padding: '1rem', border: '1px solid var(--border)' }}>
      {newText}
    </div>
  );
}

export default function VideoDashboard({ params }: { params: Promise<{ id: string }> }) {
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [improving, setImproving] = useState(false);

  // Form states
  const [views, setViews] = useState(0);
  const [ctr, setCtr] = useState(0);
  const [watchTime, setWatchTime] = useState(0);

  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const fetchVideo = async (videoId: string) => {
    try {
      const res = await fetch(`/api/videos/${videoId}`);
      if (res.ok) {
        const data = await res.json();
        setVideo(data);
        setViews(data.views);
        setCtr(data.ctr);
        setWatchTime(data.watchTime);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchVideo(id);
  }, [id]);

  const handleImprove = async () => {
    if (!id) return;
    setImproving(true);
    try {
      // First update metrics
      await fetch(`/api/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ views, ctr, watchTime })
      });
      // Trigger AI Improve
      await fetch(`/api/videos/${id}/improve`, {
        method: 'POST'
      });
      // Refresh
      await fetchVideo(id);
    } catch (e) {
      console.error(e);
    } finally {
      setImproving(false);
    }
  };

  if (loading || !video) return <div>Loading Performance Data... 💻</div>;

  const metadata = video.metadata ? JSON.parse(video.metadata) : null;
  const currentDesc = video.descriptions?.[0];

  return (
    <div>
      <Link href="/" className="btn btn-secondary" style={{ marginBottom: '2rem', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>

      <div className="header" style={{ display: 'block' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{video.title}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          <a href={video.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)' }}>{video.url}</a>
        </p>
      </div>

      <div className="grid">
        {/* LEFT COLUMN: Optimizer Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ borderColor: 'var(--accent-primary)', marginBottom: 0 }}>
            <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>📈 SEO Auto Optimizer</h2>
            
            <div className="input-group">
              <label>Current Views</label>
              <input type="number" className="input" value={views} onChange={e => setViews(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>CTR (%)</label>
              <input type="number" step="0.1" className="input" value={ctr} onChange={e => setCtr(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Avg Watch Time (mins)</label>
              <input type="number" step="0.1" className="input" value={watchTime} onChange={e => setWatchTime(Number(e.target.value))} />
            </div>

            <button className="btn" onClick={handleImprove} disabled={improving} style={{ width: '100%', marginTop: '1rem' }}>
              {improving ? 'Optimizing Description...' : '🔥 Improve Now'}
            </button>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
             <h2 style={{ marginBottom: '1rem' }}>Latest Description (v{currentDesc?.version})</h2>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
               <span className="badge badge-success">Score: {currentDesc?.seoScore}/100</span>
               <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(currentDesc?.createdAt).toLocaleString()}</span>
             </div>
             {currentDesc?.changelog && (
               <div style={{ background: 'rgba(255,0,60,0.1)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--accent-primary)' }}>
                 <strong>AI Update:</strong> {currentDesc.changelog}
               </div>
             )}
             <textarea className="textarea" readOnly style={{ height: '250px' }} value={currentDesc?.content || ''} />
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <h2 style={{ marginBottom: '1rem' }}>Version History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {video.descriptions?.map((desc: any) => (
                <div key={desc.id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-tertiary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong>v{desc.version}</strong>
                    <span className="badge badge-warning">Score {desc.seoScore}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {desc.changelog || 'Original Version'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Generated Assets (Titles, Tags, CTAs) */}
        {metadata && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <h2 style={{ marginBottom: '1rem', color: 'var(--accent-secondary)' }}>🔥 Viral Titles</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {metadata.titles?.map((t: string, i: number) => (
                  <li key={i} style={{ padding: '0.5rem', background: 'var(--bg-primary)', marginBottom: '0.5rem', borderRadius: '4px', borderLeft: '3px solid var(--accent-secondary)' }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <h2 style={{ marginBottom: '1rem' }}>🔑 Recommended Tags</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {metadata.tags?.map((t: string, i: number) => (
                  <span key={i} className="badge" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>{t}</span>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <h2 style={{ marginBottom: '1rem' }}>⚡ Hook & Captions</h2>
              <div style={{ background: 'var(--bg-primary)', padding: '1rem', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>First 10s Hook:</strong>
                {metadata.hook}
              </div>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {metadata.captionScript?.map((c: string, i: number) => <li key={i} style={{ marginBottom: '0.25rem' }}>{c}</li>)}
              </ul>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <h2 style={{ marginBottom: '1rem' }}>🖼️ Thumbnail & CTAs</h2>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Thumbnail Idea:</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{metadata.thumbnailIdea}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>CTA Strategy:</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{metadata.ctaStrategy}</p>
              </div>
              <div>
                <strong>Pinned Comment:</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '0.5rem', marginTop: '0.5rem' }}>
                  {metadata.pinnedComment}
                </p>
              </div>
            </div>

            {metadata.shortsIdeas && metadata.shortsIdeas.length > 0 && (
              <div className="card" style={{ marginBottom: 0 }}>
                <h2 style={{ marginBottom: '1rem' }}>🎬 Shorts Ideas</h2>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {metadata.shortsIdeas.map((s: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
