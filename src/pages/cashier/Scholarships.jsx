import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Award,
  CheckCircle2,
  Printer,
  X,
  Clock,
  AlertCircle,
  UserCheck,
  Zap,
  FileCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { StatCard, SectionHeader } from "../../components/cashier/CashierComponents";

const Scholarships = () => {
  const { API_BASE_URL } = useAuth();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Pending");

  // Modal & Data States
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedGrantData, setSelectedGrantData] = useState(null);
  const [receiptInfo, setReceiptInfo] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/cashier/get_all_approved_scholarships.php`,
      );
      if (res.data.status === "success") {
        setGrants(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  // 1. TRIGGER CONFIRMATION
  const triggerConfirm = (grant) => {
    setSelectedGrantData(grant);
    setShowConfirm(true);
  };

  // 2. PROCESS PAYMENT (POST TO DATABASE)
  const handleApplyNow = async () => {
    if (!selectedGrantData) return;
    setProcessing(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/cashier/apply_scholarship_to_billing.php`,
        {
          application_id: selectedGrantData.id,
          student_id: selectedGrantData.student_id,
          discount_value: selectedGrantData.value,
          discount_type: selectedGrantData.discount_type,
          scholarship_name: selectedGrantData.scholarship_name,
        },
      );

      if (res.data.status === "success") {
        setReceiptInfo(res.data); // Save the response breakdown
        setShowConfirm(false);
        setShowSuccess(true);
        fetchGrants(); // Refresh table data
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Grant application failed.");
    } finally {
      setProcessing(false);
    }
  };

  // 3. PRINT RECEIPT
  const handlePrintGrantReceipt = () => {
    if (!receiptInfo) return;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(`
      <html>
        <head><title>Receipt</title><script src="https://cdn.tailwindcss.com"></script></head>
        <body onload="window.print();window.close()" class="p-8">
          <h1 class="text-center font-black uppercase border-b pb-2">Scholarship Posted</h1>
          <div class="my-4 text-[10px] uppercase">
            <p>Student: ${selectedGrantData?.first_name} ${selectedGrantData?.last_name}</p>
            <p>Grant: ${selectedGrantData?.scholarship_name}</p>
          </div>
          <div class="border-t pt-2">
            ${receiptInfo.applied_items
              ?.map(
                (item) => `
              <div class="flex justify-between text-[10px]">
                <span>${item.item_name}</span>
                <span>-₱${item.discount.toLocaleString()}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          <div class="mt-4 font-black border-t pt-2 flex justify-between">
            <span>TOTAL SAVED:</span>
            <span>₱${receiptInfo.total_deduction?.toLocaleString()}</span>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredGrants = grants.filter(
    (g) =>
      (g.first_name + " " + g.last_name + " " + g.student_id)
        .toLowerCase()
        .includes(search.toLowerCase()) && g.status === activeTab,
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* HEADER & STATCARD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">
            Scholarships
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase mt-1">
            Manage Applications
          </p>
        </div>
        <StatCard
          title={`${activeTab} Count`}
          value={filteredGrants.length.toString()}
          icon={Award}
          colorClass="bg-indigo-600"
        />
      </div>

      {/* SEARCH & TABS */}
      <div className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-14 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-xs outline-none focus:border-indigo-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          {["Pending", "Approved", "Rejected", "Applied"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm p-8 overflow-hidden">
        <SectionHeader title={`${activeTab} List`} icon={FileCheck} />
        <div className="mt-8 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 border-b-2 border-slate-50">
                <th className="pb-4 text-left px-2">Student</th>
                <th className="pb-4 text-left px-2">Grant</th>
                <th className="pb-4 text-center px-2">Value</th>
                <th className="pb-4 text-right px-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredGrants.map((grant) => (
                <tr key={grant.id} className="group hover:bg-slate-50/50">
                  <td className="py-5 px-2">
                    <p className="text-xs font-black text-slate-800 uppercase">
                      {grant.first_name} {grant.last_name}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold italic">
                      {grant.student_id}
                    </p>
                  </td>
                  <td className="py-5 px-2">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase italic">
                      {grant.scholarship_name}
                    </span>
                  </td>
                  <td className="py-5 px-2 text-center font-black italic">
                    {grant.discount_type === "Percentage"
                      ? `${grant.value}%`
                      : `₱${parseFloat(grant.value).toLocaleString()}`}
                  </td>
                  <td className="py-5 px-2 text-right">
                    {activeTab === "Approved" && (
                      <button
                        onClick={() => triggerConfirm(grant)}
                        className="bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase hover:bg-indigo-600 transition-all flex items-center gap-2 ml-auto"
                      >
                        <Zap size={12} fill="currentColor" /> Apply
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border-b-[12px] border-amber-500">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic">
              Confirm Posting?
            </h2>
            <p className="text-slate-500 text-xs font-bold mt-4">
              Apply grant to{" "}
              <span className="text-slate-900">
                {selectedGrantData?.first_name} {selectedGrantData?.last_name}
              </span>
              ?
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleApplyNow}
                disabled={processing}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] hover:bg-indigo-600"
              >
                {processing ? "Processing..." : "Confirm Application"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-[10px] font-black text-slate-400 uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL (RECEIPT) */}
      {showSuccess && receiptInfo && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-[4rem] w-full max-w-sm p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic leading-tight">
              Posted!
            </h2>
            <div className="mt-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-left">
              <div className="space-y-2">
                {receiptInfo.applied_items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-[10px] font-bold text-slate-600 py-1 border-b"
                  >
                    <span>{item.item_name}</span>
                    <span className="text-emerald-600">
                      -₱{item.discount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t-2 border-dashed flex justify-between font-black text-slate-800 text-xs italic">
                <span>TOTAL SAVED</span>
                <span className="text-indigo-600">
                  ₱{receiptInfo.total_deduction?.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <button
                onClick={handlePrintGrantReceipt}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-indigo-600"
              >
                <Printer size={18} /> Print Confirmation
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full text-slate-400 font-black uppercase text-[9px] pt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;
