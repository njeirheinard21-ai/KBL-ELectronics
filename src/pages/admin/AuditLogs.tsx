import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QueryDocumentSnapshot, DocumentData, collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";

export function AuditLogs() {
  const [pageHistory, setPageHistory] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const currentLastDoc = currentPage > 0 ? pageHistory[currentPage - 1] : undefined;

  const fetchLogs = async (pageSize = 10, lastDoc?: QueryDocumentSnapshot<DocumentData>) => {
    let q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(pageSize));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    const snapshot = await getDocs(q);
    return {
      logs: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    };
  };

  const { data, isLoading: loading, isError, refetch } = useQuery({
    queryKey: ['admin', 'audit_logs', currentPage],
    queryFn: () => fetchLogs(15, currentLastDoc),
  });

  const logs = data?.logs || [];
  const nextDoc = data?.lastDoc;

  const handleNextPage = () => {
    if (nextDoc) {
      setPageHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentPage] = nextDoc;
        return newHistory;
      });
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Audit Logs - Admin - KBL Electronics</title>
      </Helmet>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-brand-primary" />
            Audit Logs
          </h1>
          <p className="text-fg-muted text-sm mt-1">System activity and transaction logs</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-fg-muted">
            <thead className="bg-white/5 text-xs uppercase font-bold text-fg-muted border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Actor / User ID</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-fg0">Loading logs...</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-red-400">Failed to load logs. <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-2 border-white/10 text-white">Retry</Button></td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-fg0">No logs found.</td>
                </tr>
              ) : (
                logs.map((log: DocumentData) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'N/A'}</td>
                  <td className="px-6 py-4 font-bold text-white">{log.action}</td>
                  <td className="px-6 py-4 font-mono text-xs">{log.userId || log.actor || 'System'}</td>
                  <td className="px-6 py-4 text-xs">
                    {log.orderId && <div>Order: {log.orderId}</div>}
                    {log.productId && <div>Product: {log.productId}</div>}
                    {log.oldStock !== undefined && <div>Stock: {log.oldStock} &rarr; {log.newStock}</div>}
                    {log.reason && <div>Reason: {log.reason}</div>}
                    {log.oldStatus && <div>Status: {log.oldStatus} &rarr; {log.newStatus}</div>}
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 mt-auto">
          <div className="text-sm text-fg-muted">Page {currentPage + 1}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 0 || loading} className="border-white/10 hover:bg-white/10 text-white"><ChevronLeft className="h-4 w-4 mr-1" /> Prev</Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!nextDoc || loading || logs.length < 15} className="border-white/10 hover:bg-white/10 text-white">Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
