import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !student) return;
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          studentName: student.name,
          message: newMessage,
          type: 'student',
          createdAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const chatGroups = [
    { id: 'support', name: 'Support', icon: 'support_agent', color: 'bg-green-500', description: 'Get help from our team' },
    { id: 'doubts', name: 'Doubt Clearing', icon: 'help', color: 'bg-blue-500', description: 'Ask your academic doubts' },
    { id: 'announcements', name: 'Announcements', icon: 'campaign', color: 'bg-orange-500', description: 'Important updates' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-brandBlue text-white pt-6 pb-4 px-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => activeChat ? setActiveChat(null) : navigate(-1)} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold">{activeChat ? chatGroups.find(c => c.id === activeChat)?.name : 'Messages'}</h1>
        </div>
      </header>

      {!activeChat ? (
        <main className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-rounded text-brandBlue">forum</span>
              Chat Channels
            </h3>
            <div className="space-y-3">
              {chatGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveChat(group.id)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-12 h-12 ${group.color} rounded-full flex items-center justify-center`}>
                    <span className="material-symbols-rounded text-white">{group.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm">{group.name}</p>
                    <p className="text-[10px] text-gray-400">{group.description}</p>
                  </div>
                  <span className="material-symbols-rounded text-gray-400">chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-rounded text-brandBlue">history</span>
              Recent Messages
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="material-symbols-rounded animate-spin text-2xl text-brandBlue">progress_activity</span>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-3">
                {messages.slice(0, 5).map((msg, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-brandBlue rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">
                        {msg.studentName?.charAt(0)?.toUpperCase() || 'S'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{msg.studentName || 'Student'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{msg.message}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm py-8">No messages yet</p>
            )}
          </div>
        </main>
      ) : (
        <div className="flex flex-col h-[calc(100vh-64px)]">
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages
              .filter(m => m.channel === activeChat || !m.channel)
              .map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'student' && msg.studentId === student?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.type === 'student' && msg.studentId === student?.id
                        ? 'bg-brandBlue text-white rounded-br-sm'
                        : 'bg-white shadow-sm rounded-bl-sm'
                    }`}
                  >
                    {msg.type !== 'student' && (
                      <p className="text-[10px] font-bold text-brandBlue mb-1">{msg.from || 'Support'}</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.type === 'student' && msg.studentId === student?.id ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            {messages.filter(m => m.channel === activeChat || !m.channel).length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-rounded text-6xl text-gray-300">chat</span>
                <p className="text-gray-400 mt-4 text-sm">No messages in this channel</p>
                <p className="text-gray-300 text-xs mt-1">Start the conversation!</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brandBlue"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="w-12 h-12 bg-brandBlue text-white rounded-xl flex items-center justify-center disabled:opacity-50"
              >
                <span className="material-symbols-rounded">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsScreen;
