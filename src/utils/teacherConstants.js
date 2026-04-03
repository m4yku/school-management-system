/**
 * Shared constants and configurations for teacher dashboard components
 * Reduces duplication and makes theming/styling changes centralized
 */

// Loading spinner and animation styles - used by all components
export const SHARED_STYLES = `
  @keyframes fadeInUpGPU {
    from { opacity: 0; transform: translate3d(0, 15px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  .animate-stagger {
    animation: fadeInUpGPU 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
    will-change: opacity, transform;
  }
  .custom-scroll::-webkit-scrollbar { 
    width: 5px; 
    height: 5px; 
  }
  .custom-scroll::-webkit-scrollbar-thumb { 
    background: rgba(156, 163, 175, 0.4); 
    border-radius: 10px; 
  }
`;

// Loading spinner component configuration
export const LOADING_SPINNER = {
  containerClass: 'flex items-center justify-center min-h-[60vh] bg-transparent',
  spinnerWrapperClass: 'flex flex-col items-center space-y-3',
  spinnerClass: 'w-8 h-8 border-4 border-white/40 border-t-indigo-600 rounded-full animate-spin shadow-md',
  textClass: 'text-sm font-bold text-indigo-600',
};

// Status badge styles for grades/remarks
export const BADGE_STYLES = {
  passed: 'bg-emerald-100/60 text-emerald-700 border-white',
  failed: 'bg-red-100/60 text-red-700 border-white',
  default: 'bg-white/60 text-slate-500 border-white',
};

// Department styles for announcements
export const DEPARTMENT_STYLES = {
  Registrar: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-100/60',
    border: 'border-white/60',
    icon: 'FileText',
  },
  Cashier: {
    color: 'text-orange-700',
    bg: 'bg-orange-100/60',
    border: 'border-white/60',
    icon: 'DollarSign',
  },
  Admin: {
    color: 'text-blue-700',
    bg: 'bg-blue-100/60',
    border: 'border-white/60',
    icon: 'ShieldAlert',
  },
  default: {
    color: 'text-slate-700',
    bg: 'bg-white/40',
    border: 'border-white/60',
    icon: 'Megaphone',
  },
};

// Priority badge types for announcements
export const PRIORITY_TYPES = {
  urgent: {
    style: 'bg-red-100/80 text-red-700',
    label: 'Urgent',
    icon: 'AlertCircle',
  },
  warning: {
    style: 'bg-amber-100/80 text-amber-700',
    label: 'Notice',
    icon: 'AlertTriangle',
  },
  info: {
    style: 'bg-blue-100/80 text-blue-700',
    label: 'Info',
    icon: 'Info',
  },
  general: {
    style: 'bg-white/60 text-slate-500',
    label: 'General',
    icon: null,
  },
};

// Stat card colors for dashboard
export const STAT_CARD_COLORS = {
  classes: { icon: 'BookOpen', color: 'text-blue-600', bg: 'bg-blue-100/60' },
  students: { icon: 'Users', color: 'text-emerald-600', bg: 'bg-emerald-100/60' },
  schedule: { icon: 'Clock', color: 'text-orange-600', bg: 'bg-orange-100/60' },
  grading: { icon: 'AlertCircle', color: 'text-red-600', bg: 'bg-red-100/60' },
};

// Subject card colors for variety
export const SUBJECT_CARD_COLORS = [
  'bg-orange-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
];

// Animation delays for staggered animations
export const ANIMATION_DELAYS = {
  header: '0ms',
  banner: '50ms',
  firstCard: '100ms',
  increment: 50, // ms between each staggered item
};