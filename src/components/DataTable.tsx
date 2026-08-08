import React from 'react';
import { DataRecord, DecimalPrecision } from '../types';
import { formatVal } from '../utils/physics';
import { Table, Trash2, Download, PlusCircle, FileSpreadsheet } from 'lucide-react';

interface DataTableProps {
  records: DataRecord[];
  precision: DecimalPrecision;
  onClearAll: () => void;
  onDeleteRecord: (id: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  records,
  precision,
  onClearAll,
  onDeleteRecord,
}) => {
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Lan,Bai_Thiet_Nghiom,F1(N),F2(N),Goc_Alpha(deg),Hop_Luc_Fhl(N),Ghi_Chu,Thoi_Gian'];
    const rows = records.map(
      (r, idx) =>
        `${idx + 1},"${r.tabName}",${r.f1},${r.f2},${r.angle},${r.fResult},"${r.notes}","${r.timestamp}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_So_Lieu_Vat_Ly_10_Bai_13.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-extrabold text-white text-base">
              BẢNG SỐ LIỆU THỰC HÀNH THÍ NGHIỆM
            </h3>
            <p className="text-xs text-slate-400">
              Nhật ký kết quả đo từ các bài thí nghiệm tổng hợp và phân tích lực
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={onClearAll}
            disabled={records.length === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 disabled:opacity-50 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa tất cả</span>
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <Table className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-xs">Chưa có kết quả nào được ghi nhận.</p>
          <p className="text-[11px] text-slate-600">
            Nhấn nút <strong>"Ghi vào Bảng Số Liệu"</strong> ở các tab thí nghiệm để lưu thông số.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/90 text-slate-200 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-3">Lần</th>
                <th className="py-3 px-3">Bài thí nghiệm</th>
                <th className="py-3 px-3 font-mono">F1 (N)</th>
                <th className="py-3 px-3 font-mono">F2 (N)</th>
                <th className="py-3 px-3 font-mono">Góc α (°)</th>
                <th className="py-3 px-3 font-mono">Fhl (N)</th>
                <th className="py-3 px-3">Ghi chú / Nhận xét</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {records.map((rec, idx) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-bold text-blue-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">{rec.tabName}</td>
                  <td className="py-2.5 px-3 text-blue-300">{formatVal(rec.f1, precision)}</td>
                  <td className="py-2.5 px-3 text-pink-300">{formatVal(rec.f2, precision)}</td>
                  <td className="py-2.5 px-3 text-purple-300">{rec.angle}°</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">
                    {formatVal(rec.fResult, precision)}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                    {rec.notes}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Xóa hàng này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
