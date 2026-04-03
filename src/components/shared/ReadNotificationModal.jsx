import React, { useState } from 'react';
import { X, Megaphone, Clock, AlertTriangle, FileText, ThumbsUp, Heart, CheckCircle2 } from 'lucide-react';
// ARCHITECT UPDATE 1: Import axios para sa reactions later
import axios from 'axios';
// ARCHITECT UPDATE 2: Import useAuth para makuha ang API URL at User Info
import { useAuth } from '../../context/AuthContext'; 

const ReadNotificationModal = ({ isOpen, onClose, notification }) => {
  // Kunin ang API_BASE_URL mula sa Context
  const { API_BASE_URL, user } = useAuth();
  
  // State para sa Reaction ng user (Temporary dummy state)
  const [reaction, setReaction] = useState(null); 

  if (!isOpen || !notification) return null;

  // Render proper icon based on type
  const getIcon = () => {
    switch (notification.type) {
      case 'Urgent Alert': return <AlertTriangle size={24} className="text-red-500" />;
      case 'Task Reminder': return <Clock size={24} className="text-amber-500" />;
      case 'System Message': return <FileText size={24} className="text-blue-500" />;
      default: return <Megaphone size={24} className="text-blue-600" />;
    }
  };

// Sa loob ng ReadNotificationModal component
const handleReact = async (type) => {
    const currentId = user.role === 'student' ? user.student_id : user.id;
    const newReaction = reaction === type ? null : type;
    setReaction(newReaction);

    try {
        await axios.post(`${API_BASE_URL}/notifications/react_to_notif.php`, {
            notification_id: notification.id,
            user_id: currentId,
            reaction: newReaction
        });
        // Optional: I-refresh ang parent list kung kailangan ipakita ang updated reaction count
    } catch (error) {
        console.error("Reaction error:", error);
    }
};

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 flex justify-between items-start pt-6 shrink-0 border-b border-slate-100 bg-slate-50/50">
          <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-2xl shrink-0 ${notification.type === 'Urgent Alert' ? 'bg-red-100' : notification.type === 'Task Reminder' ? 'bg-amber-100' : 'bg-blue-100'}`}>
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 leading-tight mb-1 tracking-tight">{notification.title}</h2>
              <p className="text-xs text-slate-500 font-medium">
                Sent by <span className="font-bold text-slate-700">{notification.sender}</span> • {notification.time}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY (Scrollable) */}
        <div className="p-6 pt-2 overflow-y-auto custom-scrollbar flex-1">
          {notification.dueDate && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-700">
               <Clock size={14} /> Due: {notification.dueDate}
            </div>
          )}
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
            {notification.message}
          </div>

          {/* ==========================================
          {/* 🖼️ ARCHITECT UPDATE: DYNAMIC IMAGE DISPLAY
          {/* ========================================== */}
          {/* Titingin tayo sa 'attachment' column mula sa backend. Kung may laman, lilitaw ang image tag. */}
          {notification.attachment && (
            <div className="mt-4 rounded-2xl overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-200">
              {/* ✅ DYNAMIC URL: Gagamitin na natin ang API_BASE_URL at ang filename mula sa DB */}
              <img 
                src={`${API_BASE_URL}/uploads/notifications/${notification.attachment}`} 
                alt="Announcement Attachment" 
                className="w-full h-auto object-cover animate-in fade-in" 
              />
            </div>
          )}
          {/* ========================================== */}
        </div>

        {/* REACTIONS & FOOTER (Shrink-0) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          
          {/* Reaction Bar */}
          <div className="flex gap-2">
            <button 
              onClick={() => handleReact('like')}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${reaction === 'like' ? 'bg-blue-100 text-blue-600' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              <ThumbsUp size={14} className={reaction === 'like' ? 'fill-blue-600' : ''} /> 
              {reaction === 'like' ? 'Liked' : 'Like'}
            </button>
            <button 
              onClick={() => handleReact('heart')}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${reaction === 'heart' ? 'bg-red-100 text-red-600' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              <Heart size={14} className={reaction === 'heart' ? 'fill-red-600' : ''} />
              {reaction === 'heart' ? 'Loved' : 'Love'}
            </button>
            <button 
              onClick={() => handleReact('noted')}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${reaction === 'noted' ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              <CheckCircle2 size={14} /> 
              {reaction === 'noted' ? 'Noted' : 'Acknowledge'}
            </button>
          </div>

          <button onClick={onClose} className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold rounded-xl transition-all">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReadNotificationModal;