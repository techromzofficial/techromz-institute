'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Search, Send, Circle } from 'lucide-react';
import { api } from '@/lib/api';
import { initials } from '@/lib/utils';

const MOCK_CONVERSATIONS = [
  { id: 'c1', buyer: 'Ahmed Al-Farsi',  country: 'AE', lastMsg: 'Can you confirm the phytosanitary certificate?', time: '10 min', unread: 2, online: true,  product: 'Ceylon Black Tea' },
  { id: 'c2', buyer: 'Kim Ji-won',      country: 'KR', lastMsg: 'Thank you, the samples arrived yesterday.',       time: '1h',    unread: 0, online: false, product: 'Coconut Shell Charcoal' },
  { id: 'c3', buyer: 'Sarah Johnson',   country: 'US', lastMsg: 'What is your best price for 500 Kg/month?',      time: '3h',    unread: 1, online: false, product: 'Cinnamon Sticks' },
  { id: 'c4', buyer: 'Yuki Tanaka',     country: 'JP', lastMsg: 'We would like to place a trial order.',          time: '1d',    unread: 0, online: true,  product: 'Batik Sarong' },
  { id: 'c5', buyer: 'Marco Vitali',    country: 'IT', lastMsg: 'Please send me your catalogue.',                 time: '2d',    unread: 0, online: false, product: 'Industrial Rubber' },
];

const MOCK_MESSAGES = {
  c1: [
    { id: 1, from: 'buyer',    text: 'Hello, I am interested in your BOPF Ceylon Tea. Do you export to the Middle East?', time: '9:00 AM' },
    { id: 2, from: 'supplier', text: 'Yes, we regularly ship to UAE, Saudi Arabia, and Qatar. All our products include a phytosanitary certificate.', time: '9:15 AM' },
    { id: 3, from: 'buyer',    text: 'Excellent! What is your MOQ and price for 200 Kg per shipment?', time: '9:18 AM' },
    { id: 4, from: 'supplier', text: 'Our MOQ is 50 Kg. Price is US$12.50/Kg for 200 Kg orders. Lead time is 14 days.', time: '9:30 AM' },
    { id: 5, from: 'buyer',    text: 'Can you confirm the phytosanitary certificate?', time: '10:45 AM' },
  ],
  c2: [
    { id: 1, from: 'buyer',    text: 'Hi, we received the sample shipment. Quality looks excellent!', time: 'Yesterday' },
    { id: 2, from: 'supplier', text: 'Glad to hear that! Would you like to proceed with a full order?', time: 'Yesterday' },
    { id: 3, from: 'buyer',    text: 'Thank you, the samples arrived yesterday.', time: '10:00 AM' },
  ],
};

export default function SupplierMessagesPage() {
  const [convos,   setConvos]   = useState([]);
  const [active,   setActive]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/supplier/messages');
        setConvos(data.data || data);
      } catch {
        setConvos(MOCK_CONVERSATIONS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openConvo = (c) => {
    setActive(c);
    setMessages(MOCK_MESSAGES[c.id] || []);
    setConvos((prev) => prev.map((item) => item.id === c.id ? { ...item, unread: 0 } : item));
  };

  const sendMessage = () => {
    if (!input.trim() || !active) return;
    const msg = { id: Date.now(), from: 'supplier', text: input.trim(), time: 'Just now' };
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  const filtered = convos.filter((c) =>
    !search || c.buyer.toLowerCase().includes(search.toLowerCase()) || c.product.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500">{convos.reduce((s, c) => s + c.unread, 0)} unread</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map((c) => (
                <button key={c.id} onClick={() => openConvo(c)}
                  className={`w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${active?.id === c.id ? 'bg-primary-50' : ''}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-bold text-sm flex items-center justify-center">
                      {initials(c.buyer)}
                    </div>
                    {c.online && <Circle size={8} className="absolute bottom-0 right-0 text-green-500 fill-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800 line-clamp-1">{c.buyer}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{c.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{c.product}</p>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-1">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          {active ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-800 font-bold text-sm flex items-center justify-center">
                    {initials(active.buyer)}
                  </div>
                  {active.online && <Circle size={8} className="absolute bottom-0 right-0 text-green-500 fill-green-500" />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{active.buyer} · {active.country}</p>
                  <p className="text-xs text-gray-400">{active.online ? 'Online' : 'Offline'} · {active.product}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === 'supplier' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                      m.from === 'supplier'
                        ? 'bg-primary-800 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      <p>{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.from === 'supplier' ? 'text-primary-200' : 'text-gray-400'}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-9 h-9 flex items-center justify-center bg-primary-800 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex-shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <MessageSquare size={48} className="text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">Select a conversation</p>
              <p className="text-xs text-gray-400 mt-1">Choose a buyer from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
