import { useEffect, useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { activeApi as api } from '../api/client';
import { Card } from '@zoo/ui';
import type { Student } from '../types';

const SUBJECTS = ['All', 'Piano', 'Guitar', 'Drums', 'Carnatic Vocals', 'Western Vocals', 'Violin', 'Hindustani Vocals'];
const STATUSES = ['All', 'Active', 'Renewed', 'Re-Enrolled', 'Not Renewed', 'InActive'];
const DURATIONS = ['All', '12 MONTHS', '6 MONTHS', '3 MONTHS', '1 MONTHS'];

type SortKey = 'StudentID' | 'Name' | 'Subjects' | 'ExpiryDate' | 'PendingSessions';
type SortDir = 'asc' | 'desc';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('StudentID');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const perPage = 25;

  useEffect(() => {
    api.listStudents()
      .then((res) => {
        if (res.status === 'ok') setStudents((res.data as Student[]) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...students];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.Name.toLowerCase().includes(q) ||
        s.StudentID.toLowerCase().includes(q) ||
        s.Phone.includes(q) ||
        s.ContactNumber.includes(q) ||
        (s.Email?.toLowerCase().includes(q))
      );
    }

    // Filters
    if (subjectFilter !== 'All') result = result.filter(s => s.Subjects === subjectFilter || s.Instrument === subjectFilter);
    if (statusFilter !== 'All') result = result.filter(s => s.Status === statusFilter || s.EnrolmentStatus === statusFilter);
    if (durationFilter !== 'All') result = result.filter(s => s.Duration === durationFilter);

    // Sort
    result.sort((a, b) => {
      let av: string | number = '', bv: string | number = '';
      if (sortKey === 'StudentID') { av = a.StudentID; bv = b.StudentID; }
      else if (sortKey === 'Name') { av = a.Name.toLowerCase(); bv = b.Name.toLowerCase(); }
      else if (sortKey === 'Subjects') { av = a.Subjects; bv = b.Subjects; }
      else if (sortKey === 'ExpiryDate') { av = a.ExpiryDate || ''; bv = b.ExpiryDate || ''; }
      else if (sortKey === 'PendingSessions') { av = a.PendingSessions ?? 0; bv = b.PendingSessions ?? 0; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, search, subjectFilter, statusFilter, durationFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, subjectFilter, statusFilter, durationFilter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-80 bg-zinc-100 rounded animate-pulse" />
        <div className="h-96 bg-zinc-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, phone, or email..."
            className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white">
          {SUBJECTS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white">
          {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
        </select>
        <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} className="px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white">
          {DURATIONS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Durations' : d}</option>)}
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-zinc-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <th className="px-3 py-2 cursor-pointer select-none" onClick={() => toggleSort('StudentID')}>
                  <span className="flex items-center gap-1">ID <SortIcon col="StudentID" /></span>
                </th>
                <th className="px-3 py-2 cursor-pointer select-none" onClick={() => toggleSort('Name')}>
                  <span className="flex items-center gap-1">Name <SortIcon col="Name" /></span>
                </th>
                <th className="px-3 py-2 cursor-pointer select-none" onClick={() => toggleSort('Subjects')}>
                  <span className="flex items-center gap-1">Subject <SortIcon col="Subjects" /></span>
                </th>
                <th className="px-3 py-2">Level</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2 cursor-pointer select-none" onClick={() => toggleSort('ExpiryDate')}>
                  <span className="flex items-center gap-1">Expiry <SortIcon col="ExpiryDate" /></span>
                </th>
                <th className="px-3 py-2 cursor-pointer select-none text-right" onClick={() => toggleSort('PendingSessions')}>
                  <span className="flex items-center gap-1 justify-end">Sessions <SortIcon col="PendingSessions" /></span>
                </th>
                <th className="px-3 py-2">Contact</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((s) => {
                const isExpiringSoon = s.ExpiryDate && new Date(s.ExpiryDate) <= new Date(Date.now() + 30 * 86400000) && new Date(s.ExpiryDate) >= new Date();
                return (
                  <tr key={s.StudentID} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="px-3 py-2 font-mono text-xs text-zinc-500">{s.StudentID}</td>
                    <td className="px-3 py-2 font-medium text-zinc-800">{s.Name}</td>
                    <td className="px-3 py-2 text-zinc-600">{s.Subjects}</td>
                    <td className="px-3 py-2 text-zinc-500">{s.Level || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        s.Active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.Status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-zinc-500 text-xs">{s.Duration}</td>
                    <td className={`px-3 py-2 text-xs ${isExpiringSoon ? 'text-amber-600 font-semibold' : 'text-zinc-500'}`}>
                      {s.ExpiryDate || '—'}
                    </td>
                    <td className="px-3 py-2 text-right text-xs">
                      {s.CompletedSessions ?? 0}/{s.TotalSessions ?? 0}
                      {(s.PendingSessions ?? 0) > 0 && (
                        <span className="text-zinc-400 ml-1">({s.PendingSessions} left)</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-500 font-mono">{s.Phone || s.ContactNumber}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-3 border-t border-zinc-200">
            <p className="text-xs text-zinc-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs font-medium text-zinc-600 border border-zinc-200 rounded-md hover:bg-zinc-50 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs font-medium text-zinc-600 border border-zinc-200 rounded-md hover:bg-zinc-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
