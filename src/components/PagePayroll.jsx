import React, { useState } from "react";
import { payrollAPI } from "./api";
import { useFetch, useToast } from "./hooks";
import { StatCard, Badge, Spinner, ErrorState, Toast } from "./UI";
import {
  IndianRupee,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Play,
  CircleCheckBig,
  XCircle,
  CheckCircle2
} from "lucide-react";
export default function PagePayroll() {
  const { data, loading, error, refetch } = useFetch(payrollAPI.getAll);
  const { toast, showToast } = useToast();
  const [processing, setProcessing] = useState(false);

  const payrollList = Array.isArray(data)
    ? data
    : (data?.payrolls || data?.content || []);

  const processed = payrollList.filter(
    p => (p.status || "").toUpperCase() === "PROCESSED"
  ).length;

  const pending = payrollList.filter(
    p => (p.status || "").toUpperCase() !== "PROCESSED"
  ).length;

 const totalNet = payrollList.reduce(
   (sum, p) => sum + Number(p.netSalary || 0),
   0
 );


const runAll = async () => {

  setProcessing(true);

  try {

    await payrollAPI.processAll();

    await refetch();

    showToast(

      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >

        <CheckCircle2 size={18} />

        All payroll processed!

      </span>

    );

  } catch (err) {

    showToast(

      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >

        <XCircle size={18} />

        Failed to process payroll

      </span>

    );

  } finally {

    setProcessing(false);
  }
};


 const runOne = async (id) => {

   try {

     await payrollAPI.process(id);

     await refetch();

     showToast(

       <span
         style={{
           display: "flex",
           alignItems: "center",
           gap: "8px"
         }}
       >

         <CheckCircle2 size={18} />

         Payroll processed!

       </span>

     );

   } catch {

     showToast(

       <span
         style={{
           display: "flex",
           alignItems: "center",
           gap: "8px"
         }}
       >

         <XCircle size={18} />

         Failed

       </span>

     );
   }
 };


  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="hr-page">
      <Toast message={toast} />

      <div className="hr-page-header-row">
        <h2 className="hr-page-heading">Payroll Management</h2>

        <button
          className="hr-primary-btn"
          onClick={runAll}
          disabled={processing}
        >
          <>
            <Zap size={16} />
            <span style={{ marginLeft: "6px" }}>
              Process All
            </span>
          </>
        </button>
      </div>

      {/* STATS */}
      <div className="hr-stats-grid">
        <StatCard
          icon={<IndianRupee size={18} />}
          label="Total Payroll"
          value={`₹${totalNet.toLocaleString("en-IN")}`}
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          label="Processed"
          value={processed}
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Pending"
          value={pending}
        />
        <StatCard
          icon={<Users size={18} />}
          label="Total Records"
          value={payrollList.length}
        />
      </div>

      {/* TABLE */}
      <div className="hr-panel" style={{ padding: 0 }}>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Basic</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {payrollList.map((p, i) => {
              const id = p.id || i;
              const status = (p.status || "PENDING").toUpperCase();

              return (
                <tr key={id}>
                  <td>{p.employeeName}</td>
                  <td>{p.basicSalary}</td>
                  <td>{p.allowances}</td>
                  <td>{p.deductions}</td>

                 <td>
                   ₹{p.netSalary || 0}
                 </td>

                  <td>
                    <Badge status={status} />
                  </td>

                  <td>
                    {status === "PROCESSED" ? (
                      <span
                        style={{
                          color: "#22c55e",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >

                        <CircleCheckBig size={15} />

                        Done

                      </span>
                    ) : (
                     <button
                       onClick={() => runOne(id)}
                       className="hr-outline-btn"
                       style={{
                         display: "flex",
                         alignItems: "center",
                         gap: "6px"
                       }}
                     >

                       <Play size={14} />

                       Process

                     </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}