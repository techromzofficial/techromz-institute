'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Send, Paperclip, Image as ImageIcon, Search,
  Phone, Video, MoreVertical, Circle, Check, CheckCheck,
  File, X, Smile,
} from 'lucide-react';
import { api } from '@/lib/api';
import { initials, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const MOCK_CONVERSATION = {
  id: 'conv-001',
  with: {
    id: 7,
    name: 'Ahmed Al-Farsi',
    company: 'Gulf Trading House LLC',
    country: 'UAE',
    avatar: null,
    online: true,
    last_seen: null,
  },
  product: {
    id: 42,
    name: 'Premium BOPF Ceylon Black Tea — 500g Export Pack',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    price: 'USD 12.50/Kg',
    moq: '50 Kg',
  },
  messages: [
    { id: 1, from: 'them', text: 'Hello, I am interested in your BOPF Ceylon Tea. Do you export to the UAE?', time: '9:00 AM', date: 'Today', status: 'read' },
    { id: 2, from: 'me',   text: 'Yes, we regularly ship to UAE and the wider GCC region. We have export experience with Dubai Port.', time: '9:15 AM', date: 'Today', status: 'read' },
    { id: 3, from: 'them', text: 'Excellent! What is your MOQ and price for a 200 Kg order?', time: '9:18 AM', date: 'Today', status: 'read' },
    { id: 4, from: 'me',   text: 'Our MOQ is 50 Kg. For 200 Kg, the price is US$12.50/Kg. Shipping via air freight to DXB takes 5–7 days.', time: '9:30 AM', date: 'Today', status: 'read' },
    { id: 5, from: 'them', text: 'That works. Can you send me a sample before we commit to a full order?', time: '10:00 AM', date: 'Today', status: 'read' },
    { id: 6, from: 'me',   text: 'Of course! We offer 500g samples for US$25 including DHL Express shipping. I\'ll send you our sample order form.', time: '10:05 AM', date: 'Today', status: 'read' },
    { id: 7, from: 'them', text: 'Perfect. Also, can you confirm the phytosanitary certificate? Our customs requires it for plant-based products.', time: '10:45 AM', date: 'Today', status: 'delivered' },
  ],
};

const QUICK_REPLIES = [
  'Thank you for your inquiry!',
  'Yes, we can provide a certificate.',
  'Our MOQ is flexible for new buyers.',
  'Please share your target price.',
  'We can arrange sample shipment.',
];

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMe && (
        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-1">
          A
        </div>
      )}
      <div className={`max-w-[72%] group`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isMe
            ? 'bg-primary-800 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
        }`}>
          {msg.text}
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-400">{msg.time}</span>
          {isMe && (
            msg.status === 'read' ? <CheckCheck size={11} className="text-primary-400" />
            : msg.status === 'delivered' ? <CheckCheck size={11} className="text-gray-400" />
            : <Check size={11} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationContent() {
  const { conversationId } = useParams();
  const searchParams = useSearchParams();
  const { user }  = useAuth();
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);
  const inputRef  = useRef(null);

  const [conv,     setConv]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [typing,   setTyping]   = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/messages/${conversationId}`);
        setConv(data.conversation || MOCK_CONVERSATION);
        setMessages(data.messages || MOCK_CONVERSATION.messages);
      } catch {
        setConv(MOCK_CONVERSATION);
        setMessages(MOCK_CONVERSATION.messages);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input.trim()) => {
    if (!text) return;
    const msg = {
      id: Date.now(), from: 'me', text,
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      date: 'Today', status: 'sent',
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setShowReplies(false);

    // Simulate typing response
    setTimeout(() => setTyping(true), 800);
    setTimeout(() => {
      setTyping(false);
      // no auto-reply in demo
    }, 3000);

    try {
      await api.post(`/messages/${conversationId}/send`, { text });
    } catch { /* ok */ }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const c = conv || MOCK_CONVERSATION;
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = msg.date || 'Today';
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
        <Link href="/messages" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>

        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-bold text-sm flex items-center justify-center">
            {initials(c.with.name)}
          </div>
          {c.with.online && <Circle size={9} className="absolute bottom-0 right-0 text-green-500 fill-green-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm leading-tight">{c.with.name}</p>
          <p className="text-[11px] text-gray-400">
            {c.with.online ? 'Online' : `Last seen ${c.with.last_seen || 'recently'}`}
            {' · '}{c.with.company}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {c.product && (
            <Link href={`/products/${c.product.id}`} className="hidden sm:flex items-center gap-2 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <Image src={c.product.image} alt="" width={24} height={24} unoptimized className="w-6 h-6 rounded object-cover" />
              <span className="text-xs text-gray-600 line-clamp-1 max-w-[100px]">{c.product.name}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Product context bar */}
      {c.product && (
        <div className="flex items-center gap-3 px-4 py-2 bg-primary-50 border-b border-primary-100">
          <Image src={c.product.image} alt="" width={32} height={32} unoptimized className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary-800 line-clamp-1">{c.product.name}</p>
            <p className="text-[10px] text-primary-600">{c.product.price} · MOQ: {c.product.moq}</p>
          </div>
          <Link href={`/rfq?product=${c.product.id}`} className="text-[11px] bg-primary-800 text-white px-2.5 py-1 rounded-lg hover:bg-primary-700 transition-colors font-medium flex-shrink-0">
            Send RFQ
          </Link>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] text-gray-400 font-medium bg-white border border-gray-200 px-2 py-0.5 rounded-full">{date}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="space-y-3">
              {msgs.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} isMe={msg.from === 'me'} />
              ))}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-2.5 items-end">
            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {initials(c.with.name)}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
              {[0.1, 0.2, 0.3].map((d) => (
                <div key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {showReplies && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
          {QUICK_REPLIES.map((r) => (
            <button key={r} onClick={() => sendMessage(r)}
              className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 text-xs text-gray-700 rounded-full hover:border-primary-300 hover:text-primary-700 transition-colors shadow-sm">
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex items-end gap-2">
          {/* Attachment / emoji */}
          <div className="flex gap-1 flex-shrink-0 pb-1">
            <button onClick={() => setShowReplies(!showReplies)}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
              <Smile size={18} />
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
              <Paperclip size={18} />
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={() => toast.success('File attached (demo)')} />
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              rows={1}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none leading-relaxed"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          {/* Send */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="w-11 h-11 flex items-center justify-center bg-primary-800 text-white rounded-2xl hover:bg-primary-700 disabled:opacity-40 transition-colors flex-shrink-0 shadow-lg shadow-primary-800/20"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConversationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" /></div>}>
      <ConversationContent />
    </Suspense>
  );
}
