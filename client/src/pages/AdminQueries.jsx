import { useEffect, useState } from "react";
import API from "../api/axios";

function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [replyText, setReplyText] = useState({});

  const fetchQueries = async () => {
    try {
      const res = await API.get("/query");
      setQueries(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleReply = async (id) => {
    if (!replyText[id]) return alert("Enter reply");

    try {
      await API.post(`/query/reply/${id}`, {
        message: replyText[id],
      });

      alert("Reply sent ✅");

      setReplyText({ ...replyText, [id]: "" });

      fetchQueries(); // 🔥 refresh to show replies

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📩 User Queries</h2>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Replies</th>
            <th>Reply</th>
          </tr>
        </thead>

        <tbody>
          {queries.map((q) => (
            <tr key={q._id}>
              <td>{q.name}</td>
              <td>{q.email}</td>
              <td>{q.message}</td>

              {/*  SHOW REPLIES */}
              <td>
                {q.replies?.length > 0 ? (
                  q.replies.map((r, i) => (
                    <div key={i}>
                      💬 {r.message}
                    </div>
                  ))
                ) : (
                  "No replies"
                )}
              </td>

              {/* 🔥 REPLY INPUT */}
              <td>
                <input
                  type="text"
                  placeholder="Reply..."
                  value={replyText[q._id] || ""}
                  onChange={(e) =>
                    setReplyText({
                      ...replyText,
                      [q._id]: e.target.value,
                    })
                  }
                />

                <button onClick={() => handleReply(q._id)}>
                  Send
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminQueries;
