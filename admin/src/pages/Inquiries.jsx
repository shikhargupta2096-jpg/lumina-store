import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { mapInquiryFromDB } from '../utils/schemaMapper';
import { Mail, Trash2, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchInquiries = async (pageIndex = 0) => {
    setLoading(true);
    try {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, error, count } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setInquiries((data || []).map(mapInquiryFromDB));
      setHasMore(count > to + 1);
    } catch (error) {
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries(page);
  }, [page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        const { error } = await supabase.from('inquiries').delete().eq('id', id);
        if (error) throw error;
        toast.success('Inquiry deleted');
        fetchInquiries(page);
      } catch (error) {
        toast.error('Error deleting inquiry');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  if (loading && inquiries.length === 0) {
    return (
      <div className="page-transition">
        <header className="page-header">
          <div>
            <h1 className="page-title">Inquiries</h1>
            <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px'}}>Loading customer inquiries...</p>
          </div>
        </header>
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px'}}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{height: '80px', borderRadius: 'var(--radius-md)'}}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <header className="page-header">
        <div>
          <h1 className="page-title">Inquiries</h1>
          <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px'}}>Manage customer contact requests and quotes.</p>
        </div>
      </header>

      {inquiries.length === 0 ? (
        <div style={{
          padding: '64px 24px', 
          textAlign: 'center', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          marginTop: '24px'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <Inbox size={32} />
          </div>
          <p style={{color: 'var(--text-secondary)'}}>No inquiries found.</p>
        </div>
      ) : (
        <div style={{marginTop: '24px', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden'}}>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px'}}>
              <thead>
                <tr style={{borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.2)'}}>
                  <th style={{padding: '16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Customer</th>
                  <th style={{padding: '16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Interest</th>
                  <th style={{padding: '16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Details</th>
                  <th style={{padding: '16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Date</th>
                  <th style={{padding: '16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id} style={{borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s'}} className="table-row-hover">
                    <td style={{padding: '16px'}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <span style={{fontWeight: '500', color: 'var(--text-main)', fontSize: '14px'}}>{inq.name}</span>
                        <a href={`mailto:${inq.email}`} style={{color: 'var(--primary)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <Mail size={12} /> {inq.email}
                        </a>
                      </div>
                    </td>
                    <td style={{padding: '16px'}}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: 'var(--primary)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {inq.interest || 'General'}
                      </span>
                      {inq.source && (
                        <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px'}}>
                          Source: {inq.source}
                        </div>
                      )}
                    </td>
                    <td style={{padding: '16px', maxWidth: '300px'}}>
                      <p style={{
                        fontSize: '13px', 
                        color: 'var(--text-secondary)',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4'
                      }}>
                        {inq.details || '-'}
                      </p>
                    </td>
                    <td style={{padding: '16px', fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap'}}>
                      {formatDate(inq.createdAt)}
                    </td>
                    <td style={{padding: '16px', textAlign: 'right'}}>
                      <button 
                        onClick={() => handleDelete(inq.id)} 
                        className="btn-danger" 
                        style={{padding: '6px 10px', fontSize: '12px', display: 'inline-flex'}}
                        title="Delete Inquiry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{
            padding: '16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0,0,0,0.1)'
          }}>
            <span style={{fontSize: '13px', color: 'var(--text-muted)'}}>
              Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, page * PAGE_SIZE + inquiries.length)}
            </span>
            <div style={{display: 'flex', gap: '8px'}}>
              <button 
                className="btn-secondary" 
                style={{padding: '6px 12px'}} 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                className="btn-secondary" 
                style={{padding: '6px 12px'}} 
                disabled={!hasMore}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
