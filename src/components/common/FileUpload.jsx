import React, { useState } from 'react';
import { UploadCloud, Image, X, Check, Sparkles } from 'lucide-react';

export function FileUpload({ label = "Upload Issue Photo", onUpload, existingUrls = [], maxFiles = 3 }) {
  const [previews, setPreviews] = useState(existingUrls);

  const PRESET_DEMO_PHOTOS = [
    { label: "Broken Fan", url: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80" },
    { label: "Water Leakage", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80" },
    { label: "Broken Chair", url: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=600&q=80" },
    { label: "Exposed Wire", url: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80" }
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newArr = [...previews, reader.result];
        setPreviews(newArr);
        onUpload(newArr);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPreset = (presetUrl) => {
    if (previews.includes(presetUrl)) return;
    const newArr = [...previews, presetUrl];
    setPreviews(newArr);
    onUpload(newArr);
  };

  const handleRemove = (index) => {
    const newArr = previews.filter((_, i) => i !== index);
    setPreviews(newArr);
    onUpload(newArr);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        {label}
      </label>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 rounded-2xl p-4 text-center transition-colors relative cursor-pointer group">
        <input 
          type="file" 
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        />
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800">
            Click or drag photos here to attach
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Supports PNG, JPG, WEBP (AI Visual Analysis enabled)</p>
        </div>
      </div>

      {/* Quick Demo Preset Images */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-violet-600" /> Or select realistic campus sample evidence:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_DEMO_PHOTOS.map(p => {
            const isSelected = previews.includes(p.url);
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleAddPreset(p.url)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected ? <Check className="w-3 h-3" /> : <Image className="w-3 h-3 text-slate-400" />}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Previews Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previews.map((url, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group bg-slate-900">
              <img src={url} alt={`Evidence ${idx}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
