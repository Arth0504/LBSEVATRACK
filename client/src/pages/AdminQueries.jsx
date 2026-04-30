import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";

const ACCENT = "#dd2d4a";

function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({});

  useEffect(() => { fetchQueries(); }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await API.get("/query");
      setQueries(res.data);
    } catch { toast.error("Failed to load queries"); }
    finally { setLoading(false); }
  };

  const handleReply = async (id) => {
    if (!replyText[id]?.trim()) { toast.error("Please enter a reply"); return; }
    setSending(p => ({ ...p, [id]: true }));
    try {
      await API.post(`/query/reply/${id}`, { message: replyText[id] });
      toast.success("Reply sent ✓");
      setReplyText(p => ({ ...p, [id]: "" }));
      fetchQueries();
    } catch { toast.error("Failed to send reply"); }
    finally { setSending(p => ({ ...p, [id]: false })); }
  };

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">User Queries</h1>
        <p className="page-sub">{queries.length} queries received</p>
      </div>

      {queries.length === 0 ? (
        <div className="card p-16 text-center">
          <MessageSquare size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400">No queries yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map(q => (
            <div key={q._id} className="card overflow-hidden">
              {/* Query header */}
              <div
                className="flex items-start justify-between p-5 cursor-pointer hover:bg-gray-25 transition-colors"
                onClick={() => toggle(q._id)}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                       style={{ background: "#fff0f2", border: "1px solid #ffadb8", color: ACCENT }}>
                    {q.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">{q.name}</p>
                      <span className="text-xs text-gray-400">{q.email}</span>
                      {q.replies?.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {q.replies.length} repl{q.replies.length > 1 ? "ies" : "y"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{q.message}</p>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0 text-gray-400">
                  {expanded[q._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Expanded content */}
              {expanded[q._id] && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  {/* Full message */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Message</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{q.message}</p>
                  </div>

                  {/* Existing replies */}
                  {q.replies?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Replies</p>
                      <div className="space-y-2">
                        {q.replies.map((r, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "#fff0f2", border: "1px solid #ffadb8" }}>
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: ACCENT }}>
                              <span className="text-white text-xs font-bold">A</span>
                            </div>
                            <p className="text-sm text-gray-700">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply input */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Send Reply</p>
                    <div className="flex gap-3">
                      <input
                        className="input flex-1"
                        type="text"
                        placeholder="Type your reply..."
                        value={replyText[q._id] || ""}
                        onChange={e => setReplyText(p => ({ ...p, [q._id]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && handleReply(q._id)}
                      />
                      <button
                        onClick={() => handleReply(q._id)}
                        disabled={sending[q._id]}
                        className="btn-primary px-5 gap-2"
                      >
                        <Send size={15} /> {sending[q._id] ? "Sending..." : "Reply"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminQueries;
