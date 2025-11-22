import React, { useState, useEffect } from 'react';
import { FileJson } from 'lucide-react';

const JsonGridEditor = ({ content }) => {
    const [parsedData, setParsedData] = useState([]);
    const [columnKeys, setColumnKeys] = useState([]);
    const [error, setError] = useState(null);

    // Convert column index to letter (0 -> A, 1 -> B, etc.)
    const getColumnLetter = (index) => {
        let letter = '';
        let num = index;
        while (num >= 0) {
            letter = String.fromCharCode(65 + (num % 26)) + letter;
            num = Math.floor(num / 26) - 1;
        }
        return letter;
    };

    useEffect(() => {
        try {
            const data = JSON.parse(content);
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    // Get union of all keys to handle irregular JSON arrays
                    const allKeys = new Set();
                    data.forEach(item => Object.keys(item).forEach(key => allKeys.add(key)));
                    const keys = Array.from(allKeys);

                    // Use actual property names as column headers
                    setColumnKeys(keys);
                    setParsedData(data);
                    setError(null);
                } else {
                    // Empty array
                    setColumnKeys([]);
                    setParsedData([]);
                    setError(null);
                }
            } else {
                throw new Error("Data must be an array");
            }
        } catch (e) {
            setError("Invalid JSON structure");
            setParsedData([]);
            setColumnKeys([]);
        }
    }, [content]);

    if (error) return (
        <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-950/50 m-4 rounded-xl border border-slate-700 border-dashed">
            <div className="text-center p-8">
                <FileJson size={48} className="mx-auto mb-4 opacity-50 text-red-500" />
                <p className="text-lg font-mono text-red-400">{error}</p>
                <p className="text-sm mt-2 text-slate-500">Please correct the JSON format.</p>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-slate-900 shadow-inner overflow-hidden">
            {/* Info Banner - Read Only Mode */}
            <div className="flex items-center gap-2 p-3 bg-slate-800/50 border-b border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded border border-blue-500/30 font-medium">
                        📖 READ-ONLY MODE
                    </span>
                    <span>Use AI chat to modify data</span>
                </div>
            </div>

            {/* Spreadsheet Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs bg-slate-800 sticky top-0 shadow-lg z-10">
                        <tr>
                            <th className="px-4 py-3 w-16 text-center text-slate-500 font-mono border-b border-r border-slate-700 bg-slate-800">#</th>
                            {columnKeys.map((key, idx) => (
                                <th
                                    key={idx}
                                    className="px-4 py-3 font-medium border-b border-r border-slate-700 text-slate-300 min-w-[150px]"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-slate-500 font-mono">{getColumnLetter(idx)}</span>
                                        <span className="flex-1 text-cyan-400 font-semibold">
                                            {key}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-slate-200">
                        {parsedData.length === 0 ? (
                            <tr>
                                <td colSpan={columnKeys.length + 1} className="text-center py-12 text-slate-500">
                                    <p className="text-sm">No data yet. Use AI chat to add data.</p>
                                </td>
                            </tr>
                        ) : (
                            parsedData.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-4 py-2 text-center text-slate-500 font-mono text-xs border-r border-slate-800 bg-slate-900/50">
                                        {rowIdx + 1}
                                    </td>
                                    {columnKeys.map((key, colIdx) => {
                                        const value = row[key] !== undefined ? row[key] : '';
                                        const isNumeric = typeof value === 'number' || (!isNaN(parseFloat(value)) && isFinite(value) && value !== '');

                                        return (
                                            <td
                                                key={`${rowIdx}-${colIdx}`}
                                                className="px-4 py-2 border-r border-slate-800"
                                            >
                                                <div
                                                    className={`px-2 py-1 text-xs ${isNumeric ? 'text-green-400 font-semibold text-right' : 'text-slate-300'
                                                        }`}
                                                >
                                                    {value === '' ? '-' : String(value)}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JsonGridEditor;
