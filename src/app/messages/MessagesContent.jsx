'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  BadgeCheck,
  ChevronLeft,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react';
import { conversationsApi, messagesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PARTICIPANT_PLACEHOLDER =
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

function participantName(conversation) {
  return conversation?.participant?.name
    || conversation?.participant?.company_name
    || 'Marketplace user';
}

function participantImage(conversation) {
  return conversation?.participant?.image
    || conversation?.participant?.logo
    || PARTICIPANT_PLACEHOLDER;
}

function isVerifiedParticipant(conversation) {
  return Boolean(
    conversation?.participant?.verified
    || conversation?.participant?.verification_status === 'verified',
  );
}

function parseTimestamp(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function formatListTimestamp(value) {
  const date = parseTimestamp(value);
  if (!date) return '';

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatMessageTimestamp(value) {
  const date = parseTimestamp(value);
  if (!date) return '';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function conversationTimestamp(conversation) {
  return conversation?.last_message_at
    || conversation?.latest_message?.created_at
    || conversation?.updated_at;
}

function sortConversations(items) {
  return [...items].sort((first, second) => {
    const firstDate = parseTimestamp(conversationTimestamp(first));
    const secondDate = parseTimestamp(conversationTimestamp(second));
    return (secondDate?.getTime() || 0) - (firstDate?.getTime() || 0);
  });
}

export default function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const requestedConversationId = searchParams.get('id');

  const [conversations, setConversations] = useState([]);
  const [thread, setThread] = useState(null);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [listError, setListError] = useState('');
  const [threadError, setThreadError] = useState('');
  const [listReloadKey, setListReloadKey] = useState(0);
  const [threadReloadKey, setThreadReloadKey] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadConversations = async () => {
      setListLoading(true);
      setListError('');

      try {
        const response = await conversationsApi.list();
        const items = Array.isArray(response?.data) ? response.data : [];

        if (!cancelled) {
          setConversations(sortConversations(items));
        }
      } catch (error) {
        if (!cancelled) {
          setConversations([]);
          setListError(error.message || 'Could not load conversations.');
        }
      } finally {
        if (!cancelled) {
          setListLoading(false);
        }
      }
    };

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, [listReloadKey]);

  const selectedConversationId = useMemo(() => {
    if (requestedConversationId) {
      const requested = conversations.find(
        (conversation) => String(conversation.id) === String(requestedConversationId),
      );

      if (requested) return requested.id;
    }

    return conversations[0]?.id || null;
  }, [conversations, requestedConversationId]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedConversationId) {
      setThread(null);
      setThreadError('');
      setThreadLoading(false);
      return undefined;
    }

    const loadThread = async () => {
      setThreadLoading(true);
      setThreadError('');

      try {
        const response = await conversationsApi.get(selectedConversationId);
        const newestFirstMessages = Array.isArray(response?.messages)
          ? response.messages
          : [];
        const messages = [...newestFirstMessages].reverse();

        if (cancelled) return;

        setThread({
          conversation: response.conversation,
          messages,
          pagination: response.messages_pagination || null,
        });

        const unreadMessageIds = messages
          .filter(
            (message) =>
              !message.is_read
              && Number(message.receiver_id) === Number(user?.id),
          )
          .map((message) => message.id);

        if (unreadMessageIds.length > 0) {
          const readResults = await Promise.allSettled(
            unreadMessageIds.map((messageId) => messagesApi.markRead(messageId)),
          );
          const successfullyReadIds = readResults
            .map((result, index) =>
              result.status === 'fulfilled' ? unreadMessageIds[index] : null
            )
            .filter(Boolean);

          if (!cancelled && successfullyReadIds.length > 0) {
            setThread((current) => current ? {
              ...current,
              messages: current.messages.map((message) =>
                successfullyReadIds.includes(message.id)
                  ? { ...message, is_read: true }
                  : message
              ),
              conversation: {
                ...current.conversation,
                unread_count: Math.max(
                  0,
                  (current.conversation.unread_count || 0) - successfullyReadIds.length,
                ),
              },
            } : current);

            setConversations((current) => current.map((conversation) =>
              Number(conversation.id) === Number(selectedConversationId)
                ? {
                    ...conversation,
                    unread_count: Math.max(
                      0,
                      (conversation.unread_count || 0) - successfullyReadIds.length,
                    ),
                  }
                : conversation
            ));
          }
        }
      } catch (error) {
        if (!cancelled) {
          setThread(null);
          setThreadError(error.message || 'Could not load this conversation.');
        }
      } finally {
        if (!cancelled) {
          setThreadLoading(false);
        }
      }
    };

    loadThread();

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId, threadReloadKey, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [thread?.messages.length]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((conversation) =>
      participantName(conversation).toLowerCase().includes(query)
      || conversation.latest_message?.message?.toLowerCase().includes(query)
    );
  }, [conversations, search]);

  const activeConversation = thread?.conversation
    || conversations.find(
      (conversation) => Number(conversation.id) === Number(selectedConversationId),
    )
    || null;

  const handleSend = async (event) => {
    event.preventDefault();
    const message = draft.trim();

    if (!message || !selectedConversationId || sending) return;

    setSending(true);
    setThreadError('');

    try {
      const createdMessage = await messagesApi.send(selectedConversationId, message);

      setThread((current) => current ? {
        ...current,
        messages: [...current.messages, createdMessage],
        conversation: {
          ...current.conversation,
          latest_message: createdMessage,
          last_message_at: createdMessage.created_at,
        },
      } : current);

      setConversations((current) => sortConversations(
        current.map((conversation) =>
          Number(conversation.id) === Number(selectedConversationId)
            ? {
                ...conversation,
                latest_message: createdMessage,
                last_message_at: createdMessage.created_at,
              }
            : conversation
        ),
      ));
      setDraft('');
    } catch (error) {
      setThreadError(error.message || 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };

  if (listLoading) {
    return <LoadingSpinner label="Loading conversations…" />;
  }

  if (listError) {
    return (
      <div className="min-h-[480px] bg-white rounded-2xl border border-red-100 flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={36} className="text-red-400 mb-3" />
        <h2 className="font-semibold text-gray-800">Messages could not be loaded</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-md">{listError}</p>
        <button
          type="button"
          onClick={() => setListReloadKey((key) => key + 1)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 160px)', minHeight: 480 }}>
      <div className="flex h-full">
        <aside className={`w-full sm:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col ${activeConversation && requestedConversationId ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare size={30} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">
                  {conversations.length === 0
                    ? 'No conversations yet.'
                    : 'No conversations match your search.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => router.push(`/messages?id=${conversation.id}`)}
                  className={`w-full flex items-start gap-3 p-3.5 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    Number(selectedConversationId) === Number(conversation.id)
                      ? 'bg-primary-50'
                      : ''
                  }`}
                >
                  <Image
                    src={participantImage(conversation)}
                    alt=""
                    width={44}
                    height={44}
                    unoptimized
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate flex items-center gap-1">
                        {participantName(conversation)}
                        {isVerifiedParticipant(conversation) && (
                          <BadgeCheck size={12} className="text-primary-700 flex-shrink-0" />
                        )}
                      </span>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">
                        {formatListTimestamp(conversationTimestamp(conversation))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-gray-400 truncate">
                        {conversation.latest_message?.message || 'No messages yet'}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="min-w-5 h-5 px-1 flex-shrink-0 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className={`flex-1 flex-col min-w-0 ${activeConversation && requestedConversationId ? 'flex' : 'hidden sm:flex'}`}>
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
              <MessageSquare size={40} />
              <p className="text-sm text-gray-400 mt-2">Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3.5 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => router.push('/messages')}
                  className="sm:hidden text-gray-400 hover:text-gray-600"
                  aria-label="Back to conversations"
                >
                  <ChevronLeft size={20} />
                </button>
                <Image
                  src={participantImage(activeConversation)}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800 flex items-center gap-1 truncate">
                    {participantName(activeConversation)}
                    {isVerifiedParticipant(activeConversation) && (
                      <BadgeCheck size={12} className="text-primary-700" />
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {activeConversation.rfq?.title
                      ? `RFQ: ${activeConversation.rfq.title}`
                      : 'Marketplace conversation'}
                  </div>
                </div>
              </div>

              {threadLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner label="Loading conversation…" />
                </div>
              ) : threadError && !thread ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                  <AlertCircle size={34} className="text-red-400 mb-3" />
                  <p className="text-sm text-gray-600">{threadError}</p>
                  <button
                    type="button"
                    onClick={() => setThreadReloadKey((key) => key + 1)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50"
                  >
                    <RefreshCw size={14} /> Try again
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                    {thread?.messages.length ? (
                      thread.messages.map((message) => {
                        const isOwnMessage = Number(message.sender_id) === Number(user?.id);

                        return (
                          <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 text-sm ${
                              isOwnMessage
                                ? 'bg-primary-800 text-white'
                                : 'bg-white border border-gray-100 text-gray-700'
                            }`}>
                              <p className="leading-snug whitespace-pre-wrap break-words">{message.message}</p>
                              <span className={`block text-[10px] mt-1 ${
                                isOwnMessage ? 'text-primary-200' : 'text-gray-400'
                              }`}>
                                {formatMessageTimestamp(message.created_at)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <MessageSquare size={34} className="text-gray-200 mb-2" />
                        <p className="text-sm text-gray-400">No messages yet. Start the conversation.</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {threadError && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-600">
                      {threadError}
                    </div>
                  )}

                  <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex items-center gap-2">
                    <input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Type a message…"
                      maxLength={5000}
                      disabled={sending}
                      className="flex-1 px-4 py-2.5 text-sm bg-gray-50 rounded-full outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      className="w-10 h-10 flex-shrink-0 bg-primary-800 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      {sending ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
