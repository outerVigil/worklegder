import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Check } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  filenamePrefix: string;
  data: any[];
  availableColumns?: { key: string; label: string }[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  filenamePrefix,
  data,
  availableColumns,
}) => {
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const exportData = data.map((item) => {
        if (!availableColumns) return item;
        const row: Record<string, any> = {};
        availableColumns.forEach((col) => {
          row[col.label] = item[col.key] !== undefined ? item[col.key] : '';
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${filenamePrefix}_${dateStr}.${format}`;

      if (format === 'xlsx') {
        XLSX.writeFile(workbook, filename);
      } else {
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Export Report</h3>
              <p className="text-xs text-slate-500">{title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center">
            <span className="text-slate-600">Total Records to Export</span>
            <span className="font-bold text-slate-900">{data.length} records</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                  format === 'xlsx'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="p-2 bg-white rounded border border-slate-200 text-emerald-700 font-bold text-xs">
                  XLS
                </div>
                <div>
                  <div className="font-semibold text-xs">Excel Workbook</div>
                  <div className="text-[10px] text-slate-500">.xlsx standard spreadsheet</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                  format === 'csv'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="p-2 bg-white rounded border border-slate-200 text-sky-700 font-bold text-xs">
                  CSV
                </div>
                <div>
                  <div className="font-semibold text-xs">CSV File</div>
                  <div className="text-[10px] text-slate-500">Comma-separated values</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-white rounded-lg text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4" /> Downloaded!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
