import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Users, 
  Eye, 
  Edit3, 
  Hash, 
  Bold, 
  Italic, 
  Code, 
  List, 
  Terminal, 
  Sparkles,
  Database,
  ShieldCheck,
  CheckCheck,
  Server,
  MessageSquare
} from 'lucide-react';

/* ============================================================================
   DATABASE SCHEMA (MySQL / PostgreSQL equivalent)
   ============================================================================
   Table: chat-messages
   Columns:
     - id: int (Primary Key, Auto Increment)
     - sender_id: int (ID of the member or admin sending)
     - receiver_id: int (ID of the recipient or target channel/room)
     - sender_type: enum('member','admin1','admin2')
     - receiver_type: enum('member','admin1','admin2')
     - message: text (Markdown content)
     - is_read: tinyint(1) DEFAULT 0
     - created_at: datetime DEFAULT CURRENT_TIMESTAMP
   ============================================================================ */

const parseMarkdown = (text) => {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 text-emerald-400 p-3 rounded-lg my-2 font-mono text-sm overflow-x-auto border border-slate-800"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>')
    .replace(/^\s*-\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300">$1</a>')
    .replace(/\n/g, '<br />');

  return html;
};

export default function App() {
  // Current active user simulation (matches enum 'member', 'admin1', 'admin2')
  const [currentUser, setCurrentUser] = useState({
    id: 101,
    name: 'Alex Rivera',
    sender_type: 'member', // enum('member','admin1','admin2')
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
  });

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'schema'
  const [inputMode, setInputMode] = useState('write'); // 'write' or 'preview'
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Members and Admins directory
  const [participants] = useState([
    { id: 101, name: 'Alex Rivera', type: 'member', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
    { id: 1, name: 'Sarah Chen (Admin 1)', type: 'admin1', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
    { id: 2, name: 'Marcus Vance (Admin 2)', type: 'admin2', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  ]);

  // Messages matching exact chat-messages table columns
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender_id: 1,
      receiver_id: 101,
      sender_type: 'admin1',
      receiver_type: 'member',
      message: 'Welcome to the channel! All messages in **chat-messages** support full markdown syntax 🚀\n- Bullet items\n- Inline `code` styling',
      is_read: 1,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      sender_id: 2,
      receiver_id: 101,
      sender_type: 'admin2',
      receiver_type: 'member',
      message: 'Here is how administrators can push database queries using Next.js Server Actions:\n```javascript\nawait db.query(\n  "INSERT INTO `chat-messages` (sender_id, receiver_id, sender_type, receiver_type, message) VALUES (?, ?, ?, ?, ?)",\n  [senderId, receiverId, senderType, receiverType, message]\n);\n```',
      is_read: 1,
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message submission matching schema constraints
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Constructing row object matching exact chat-messages table structure
      const newMessageRow = {
        id: Date.now(),
        sender_id: currentUser.id,
        receiver_id: 1, // Target channel or broadcast recipient ID
        sender_type: currentUser.sender_type, // 'member' | 'admin1' | 'admin2'
        receiver_type: 'admin1',
        message: messageText,
        is_read: 0,
        created_at: new Date().toISOString()
      };

      // In Next.js production, call your Server Action:
      // await saveChatMessageToDatabase(newMessageRow);

      setMessages((prev) => [...prev, newMessageRow]);
      setMessageText('');
      setInputMode('write');
    } catch (err) {
      console.error('Failed to insert into chat-messages table:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertMarkdown = (syntax) => {
    switch (syntax) {
      case 'bold':
        setMessageText((prev) => prev + '**bold text**');
        break;
      case 'italic':
        setMessageText((prev) => prev + '*italic text*');
        break;
      case 'code':
        setMessageText((prev) => prev + '`inline code`');
        break;
      case 'block':
        setMessageText((prev) => prev + '\n```javascript\n// code block\n```\n');
        break;
      case 'list':
        setMessageText((prev) => prev + '\n- List item 1\n- List item 2');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar: Schema Info & Participants */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        
        {/* Workspace Title */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide">NextJS DB Chat</h1>
              <p className="text-xs text-slate-400 font-mono">chat-messages table</p>
            </div>
          </div>
        </div>

        {/* Database Schema Status Box */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" /> Schema Enums Active
          </p>
          <div className="space-y-1 text-xs text-slate-300 font-mono">
            <div className="flex justify-between bg-slate-900 px-2 py-1 rounded">
              <span className="text-slate-400">sender_type:</span>
              <span className="text-indigo-400">member | admin1 | admin2</span>
            </div>
            <div className="flex justify-between bg-slate-900 px-2 py-1 rounded">
              <span className="text-slate-400">is_read:</span>
              <span className="text-emerald-400">tinyint(1)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'chat' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Hash className="w-4 h-4" />
              <span>Active Chat Feed</span>
            </button>
            <button 
              onClick={() => setActiveTab('schema')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'schema' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Server className="w-4 h-4" />
              <span>Database & Server Action SQL</span>
            </button>
          </div>
        </div>

        {/* Participants / Chat Members list */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Members & Admins</p>
            <Users className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="space-y-2">
            {participants.map((p) => (
              <div 
                key={p.id} 
                onClick={() => setCurrentUser({ id: p.id, name: p.name, sender_type: p.type, avatar: p.avatar })}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${currentUser.id === p.id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-800/50'}`}
              >
                <div className="flex items-center space-x-3">
                  <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{p.name}</p>
                    <p className="text-[10px] text-indigo-400 uppercase font-mono">{p.type}</p>
                  </div>
                </div>
                {currentUser.id === p.id && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded">Active</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Current User Session Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={currentUser.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-white">{currentUser.name}</p>
              <p className="text-xs text-indigo-400 font-mono">Role: {currentUser.sender_type}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col bg-slate-950">
        
        {/* Top Navbar */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/40 backdrop-blur">
          <div className="flex items-center space-x-3">
            <Hash className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-bold text-white text-base">chat-messages database table</h2>
              <p className="text-xs text-slate-400">Markdown rendering for all chat members and admins ({currentUser.sender_type})</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Live Chat
              </button>
              <button 
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${activeTab === 'schema' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Schema & SQL Guide
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="text-center my-2">
                <span className="bg-slate-900 text-slate-400 text-xs px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1.5 mx-auto w-fit">
                  <Database className="w-3.5 h-3.5 text-indigo-400" /> Showing rows from <code className="text-indigo-300 font-mono">chat-messages</code> table
                </span>
              </div>

              {messages.map((msg) => {
                const senderObj = participants.find(p => p.id === msg.sender_id) || { name: `User #${msg.sender_id}`, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' };
                
                return (
                  <div key={msg.id} className="flex items-start space-x-4 group">
                    <img src={senderObj.avatar} alt="Sender" className="w-10 h-10 rounded-full object-cover mt-1" />
                    <div className="flex-1 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition">
                      
                      {/* Database Row Metadata Header */}
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/60 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-indigo-300">{senderObj.name}</span>
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px] uppercase">
                            sender_type: <strong className="text-indigo-400">{msg.sender_type}</strong>
                          </span>
                          <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono text-[10px]">
                            ID: {msg.id}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="flex items-center gap-1">
                            {msg.is_read ? <CheckCheck className="w-3.5 h-3.5 text-indigo-400" title="is_read: 1" /> : <span className="w-2 h-2 rounded-full bg-slate-500" title="is_read: 0"></span>}
                          </span>
                        </div>
                      </div>

                      {/* Rendered Markdown Message */}
                      <div 
                        className="text-slate-200 text-sm leading-relaxed space-y-1 break-words mt-2"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.message) }}
                      />
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input & Markdown Toolbar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-indigo-500 transition shadow-lg">
                
                {/* Formatting Toolbar */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800">
                  <div className="flex items-center space-x-1">
                    <button type="button" onClick={() => insertMarkdown('bold')} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition" title="Bold (**text**)">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('italic')} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition" title="Italic (*text*)">
                      <Italic className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('code')} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition" title="Inline Code (`code`)">
                      <Code className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('block')} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition" title="Code Block (``` code ```)">
                      <Terminal className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('list')} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition" title="Bullet List (- item)">
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setInputMode('write')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${inputMode === 'write' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('preview')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${inputMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                </div>

                {inputMode === 'write' ? (
                  <textarea
                    rows="3"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Type markdown message as [${currentUser.sender_type}] to save to 'message' column...`}
                    className="w-full bg-transparent p-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSendMessage(e);
                      }
                    }}
                  />
                ) : (
                  <div 
                    className="w-full bg-transparent p-3 min-h-[82px] text-slate-200 text-sm overflow-y-auto max-h-36"
                    dangerouslySetInnerHTML={{ 
                      __html: messageText.trim() ? parseMarkdown(messageText) : '<span class="text-slate-500 italic">Nothing to preview yet...</span>' 
                    }}
                  />
                )}

                {/* Footer Submit */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/40 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    Inserting into <code className="text-indigo-300">chat-messages</code> with role <code className="text-indigo-300">{currentUser.sender_type}</code>
                  </span>
                  <button
                    type="submit"
                    disabled={!messageText.trim() || isSubmitting}
                    className="ml-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Saving...' : 'Send Message'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : (
          /* Database Schema & SQL Guide Tab */
          <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" /> Exact Database Table Definition: <code className="text-indigo-400 font-mono">chat-messages</code>
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Execute this SQL command in MySQL or PostgreSQL to create the table matching your exact specifications.
              </p>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
{`CREATE TABLE chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  sender_type ENUM('member', 'admin1', 'admin2') NOT NULL,
  receiver_type ENUM('member', 'admin1', 'admin2') NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" /> Next.js Server Action (`app/actions.ts`)
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Server action to handle insertion of markdown chat messages with the exact enum constraints.
              </p>
              <pre className="bg-slate-950 text-indigo-300 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
{`'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function sendChatMessage({
  sender_id,
  receiver_id,
  sender_type,
  receiver_type,
  message
}) {
  const query = \`
    INSERT INTO chat_messages 
    (sender_id, receiver_id, sender_type, receiver_type, message, is_read, created_at) 
    VALUES (?, ?, ?, ?, ?, 0, NOW())
  \`;

  await db.query(query, [sender_id, receiver_id, sender_type, receiver_type, message]);
  
  revalidatePath('/chat');
}`}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}