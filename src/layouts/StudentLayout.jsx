// src/layouts/StudentLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  User, BookOpen, CreditCard, LogOut, Menu, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ProfileModal from '../components/student/ProfileModal';

const StudentLayout = () => {
  const { user, logout, branding } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal state
  const [studentData, setStudentData] = useState(null);
  
  const location = useLocation();
  const API_BASE_URL = "http://localhost/sms-api";

  const [editForm, setEditForm] = useState({ email: '', contact_no: '', address: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchData = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/get_students.php`);
    const myData = res.data.find(s => s.email === user.email);
    if (myData) {
      setStudentData(myData);
      // Siguraduhin na ang column names dito ay tugma sa database mo
      setEditForm({ 
        email: myData.email || '', 
        contact_no: myData.mobile_no || '',  // Gamitin ang column name mula sa DB
        address: myData.address_house || ''  // Gamitin ang column name mula sa DB
      });
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
};

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user.email]);

  const studentMenu = [
    { icon: <User size={18}/>, label: "Dashboard", path: "/student/dashboard" },
    { icon: <BookOpen size={18}/>, label: "LMS Classroom", path: "/student/lms" },
    { icon: <CreditCard size={18}/>, label: "Accounting", path: "/student/accounting" },
  ];

  const getPageTitle = () => {
    if (location.pathname.includes('dashboard')) return 'Student Dashboard';
    if (location.pathname.includes('accounting')) return 'Accounting Portal';
    if (location.pathname.includes('lms')) return 'LMS Classroom';
    return 'Student Portal';
  };

  const handleUpdateProfile = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('student_id', studentData.student_id);
  formData.append('email', editForm.email);
  formData.append('contact_no', editForm.contact_no);
  formData.append('address', editForm.address);
  
  if (selectedFile) formData.append('profile_image', selectedFile);

  try {
    const res = await axios.post(`${API_BASE_URL}/update_student.php`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (res.data.success) {
      alert("Profile updated successfully!");
      
      // 1. ISARA ANG MODAL
      setIsEditModalOpen(false);
      
      // 2. I-REFRESH ANG DATA (Ito ang importante para mag-display ang bago)
      fetchData(); 
      
      // 3. I-CLEAR ANG FILE PREVIEW
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      alert("Error: " + res.data.message);
    }
  } catch (err) {
    console.error("Update failed:", err);
    alert("Update failed.");
  }
};

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside 
        style={{ backgroundColor: branding.theme_color }} 
        className={`fixed inset-y-0 left-0 z-50 w-72 text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 border-r-4 border-yellow-500 shadow-2xl shrink-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 text-center border-b border-white/5 relative">
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-white/50 hover:text-white"><X size={20}/></button>
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-yellow-500 shadow-xl">
            {branding.school_logo ? <img src={branding.school_logo} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-slate-800 font-black text-xl italic">CSPB</span>}
          </div>
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 leading-tight">{branding.school_name}</h2>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Student Menu</p>
          {studentMenu.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${location.pathname === item.path ? 'bg-yellow-500 text-[#001f3f] shadow-lg' : 'hover:bg-white/10 text-slate-300'}`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button onClick={logout} className="flex items-center space-x-3 p-4 w-full rounded-2xl hover:bg-red-500 text-white transition-all duration-200 group">
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        
        {/* TOP NAV */}
        <nav className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 bg-slate-100 rounded-xl"><Menu size={20} /></button>
            <h2 className="font-black text-slate-800 text-sm uppercase tracking-widest hidden sm:block">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-3 relative">
            <div className="hidden md:block text-right">
              <p className="text-[11px] font-black text-slate-900 leading-none mb-1">{studentData?.first_name} {studentData?.last_name}</p>
              <p className={`text-[9px] font-bold uppercase tracking-widest ${studentData?.enrollment_status === "Verified" ? "text-green-600" : "text-orange-500"}`}>
                {studentData?.enrollment_status === "Verified" ? "SYSTEM VERIFIED" : "PENDING ACCESS"}
              </p>
            </div>

            {/* CLICKABLE PROFILE PICTURE - Deretso sa Edit Profile Modal */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              style={{ backgroundColor: branding.theme_color }}
              className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-md hover:scale-110 active:scale-95 transition-all overflow-hidden cursor-pointer"
              title="Edit Profile"
            >
              {studentData?.profile_image ? (
                <img src={`${API_BASE_URL}/uploads/profiles/${studentData.profile_image}`} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="text-white font-black text-sm">{studentData?.first_name?.charAt(0)}</span>
              )}
            </button>
          </div>
        </nav>

        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      {/* GLOBAL PROFILE MODAL */}
      <ProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        branding={branding}
        studentData={studentData}
        editForm={editForm}
        setEditForm={setEditForm}
        previewUrl={previewUrl}
        handleFileChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          }
        }}
        handleUpdateProfile={handleUpdateProfile}
        API_BASE_URL={API_BASE_URL}
      />

      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" />}
    </div>
  );
};

export default StudentLayout;