"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    setCreating(true);
    
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, url: newUrl })
      });
      if (res.ok) {
        setNewTitle('');
        setNewUrl('');
        await fetchVideos();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>Loading supercars... 🏎️💨</div>;

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--accent-secondary)' }}>Add New NFS Video</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Video Title</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. Can this Bugatti break the speed limit?" 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Video URL</label>
            <input 
              type="url" 
              className="input" 
              placeholder="https://youtube.com/watch?v=..." 
              value={newUrl} 
              onChange={e => setNewUrl(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn" disabled={creating} style={{ height: '46px' }}>
            {creating ? 'Analyzing AI...' : 'Generate Magic ✨'}
          </button>
        </form>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Your Videos</h2>
      <div className="grid">
        {videos.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No videos analyzed yet. Enter a Need for Speed video above to start growing!</p>
        ) : (
          videos.map(v => {
            const latestDesc = v.descriptions?.[0];
            return (
              <Link href={`/video/${v.id}`} key={v.id}>
                <div className="card" style={{ cursor: 'pointer', height: '100%', transition: 'all 0.2s', border: '1px solid transparent' }} 
                     onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                     onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>{v.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <span className="badge badge-success">V{latestDesc?.version || 1}</span>
                    <span className="badge badge-warning">SEO: {latestDesc?.seoScore || 0}/100</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>Views: {v.views}</span>
                    <span>CTR: {v.ctr}%</span>
                    <span>Watch: {v.watchTime}m</span>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  );
}
