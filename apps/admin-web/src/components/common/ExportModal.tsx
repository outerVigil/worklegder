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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D040A]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl border border-[#E8E2D8] w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FDF2F4] text-[#880E23] rounded-lg border border-[#F8CAD1]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#2D2526] text-sm">Export Report</h3>
              <p className="text-xs text-[#74675B]">{title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#A89B85] hover:text-[#2D2526] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg text-xs flex justify-between items-center">
            <span className="text-[#74675B]">Total Records to Export</span>
            <span className="font-bold text-[#2D2526]">{data.length} records</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A504E] mb-2">Select Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                  format === 'xlsx'
                    ? 'border-[#880E23] bg-[#FDF2F4] text-[#880E23] ring-1 ring-[#880E23]'
                    : 'border-[#E8E2D8] hover:border-[#DDD5C7] text-[#5A504E] bg-white'
                }`}
              >
                <div className="p-2 bg-[#FAF8F5] rounded border border-[#E8E2D8] text-[#880E23] font-bold text-xs">
                  XLS
                </div>
                <div>
                  <div className="font-semibold text-xs text-[#2D2526]">Excel Workbook</div>
                  <div className="text-[10px] text-[#74675B]">.xlsx standard spreadsheet</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                  format === 'csv'
                    ? 'border-[#880E23] bg-[#FDF2F4] text-[#880E23] ring-1 ring-[#880E23]'
                    : 'border-[#E8E2D8] hover:border-[#DDD5C7] text-[#5A504E] bg-white'
                }`}
              >
                <div className="p-2 bg-[#FAF8F5] rounded border border-[#E8E2D8] text-[#880E23] font-bold text-xs">
                  CSV
                </div>
                <div>
                  <div className="font-semibold text-xs text-[#2D2526]">CSV File</div>
                  <div className="text-[10px] text-[#74675B]">Comma-separated values</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E8E2D8] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#DDD5C7] text-[#5A504E] hover:bg-white rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#880E23] hover:bg-[#6B081A] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
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
