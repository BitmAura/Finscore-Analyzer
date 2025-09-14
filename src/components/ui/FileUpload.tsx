import React, { useState } from 'react';
import { NeonButton, GlassMorphismCard } from './AdvancedComponents';

interface FileUploadProps {
  onUpload: (
    files: File[],
    password?: string,
    meta?: { displayName?: string; accountLabel?: string; perFile?: Array<{ displayName?: string; accountLabel?: string }> }
  ) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountLabel, setAccountLabel] = useState('');
  const [usePerFileMeta, setUsePerFileMeta] = useState(false);
  const [perFileMeta, setPerFileMeta] = useState<Array<{ displayName?: string; accountLabel?: string }>>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFiles(files);
    setError('');
    setPerFileMeta(files.map(() => ({ displayName: '', accountLabel: '' })));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file.');
      return;
    }
    // Validate file types
    const validTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    for (const file of selectedFiles) {
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Only PDF and Excel files are allowed.');
        return;
      }
    }
    const meta = usePerFileMeta
      ? { perFile: perFileMeta }
      : { displayName: displayName || undefined, accountLabel: accountLabel || undefined };
    onUpload(selectedFiles, password, meta);
  };

  return (
    <GlassMorphismCard className="max-w-lg mx-auto p-8 mt-12">
      <h2 className="text-2xl font-bold mb-4">Upload Financial Documents</h2>
      <input
        type="file"
        multiple
        accept=".pdf,.xls,.xlsx"
        onChange={handleFileChange}
        className="mb-4 block w-full"
      />
      <div className="mb-4 flex items-center gap-2">
        <input
          id="perFile"
          type="checkbox"
          checked={usePerFileMeta}
          onChange={(e) => setUsePerFileMeta(e.target.checked)}
        />
        <label htmlFor="perFile" className="text-sm text-gray-700">Set names/labels per file</label>
      </div>
      {!usePerFileMeta && (
        <div className="mb-4 grid grid-cols-1 gap-3">
          <input
            type="text"
            placeholder="Display name (optional)"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="block w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Account label e.g., HDFC Salary (optional)"
            value={accountLabel}
            onChange={e => setAccountLabel(e.target.value)}
            className="block w-full px-3 py-2 border rounded"
          />
        </div>
      )}
      {usePerFileMeta && selectedFiles.length > 0 && (
        <div className="mb-4 space-y-3 max-h-48 overflow-auto pr-1">
          {selectedFiles.map((f, idx) => (
            <div key={idx} className="border rounded p-3 bg-white/50">
              <p className="text-sm font-medium text-gray-800 mb-2">{f.name}</p>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  placeholder="Display name (optional)"
                  value={perFileMeta[idx]?.displayName || ''}
                  onChange={e => {
                    const v = e.target.value; const next = [...perFileMeta]; next[idx] = { ...next[idx], displayName: v }; setPerFileMeta(next)
                  }}
                  className="block w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Account label e.g., ICICI Business (optional)"
                  value={perFileMeta[idx]?.accountLabel || ''}
                  onChange={e => {
                    const v = e.target.value; const next = [...perFileMeta]; next[idx] = { ...next[idx], accountLabel: v }; setPerFileMeta(next)
                  }}
                  className="block w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <input
        type="password"
        placeholder="PDF Password (if required)"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="mb-4 block w-full px-3 py-2 border rounded"
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <NeonButton onClick={handleUpload} className="w-full">Upload</NeonButton>
    </GlassMorphismCard>
  );
}
