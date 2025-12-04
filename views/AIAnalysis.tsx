import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertOctagon, RefreshCw, Camera } from 'lucide-react';
import { analyzeMaterialImage } from '../services/geminiService';
import { AIAnalysisResult } from '../types';

const AIAnalysis: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        setImage(base64String);
        setResult(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    // Strip prefix for API call if needed, usually Gemini needs full or just data
    // The previous implementation assumes we pass data URI or base64. 
    // Let's pass the base64 data part only to the service helper
    const base64Data = image.split(',')[1];
    
    try {
      const analysis = await analyzeMaterialImage(base64Data);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      {/* Input Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <h2 className="text-xl font-bold text-slate-900 mb-2">物料 AI 视觉感知</h2>
        <p className="text-slate-500 text-sm mb-6">上传原料图片进行自动分级、形态识别和含水量估算。</p>

        <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group">
          {image ? (
            <img src={image} alt="Preview" className="w-full h-full object-contain p-4" />
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Camera size={32} />
              </div>
              <p className="text-slate-600 font-medium">点击上传或拖拽图片</p>
              <p className="text-slate-400 text-xs mt-2">支持 JPG, PNG</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3 px-4 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            选择图片
          </button>
          <button 
            onClick={handleAnalyze}
            disabled={!image || loading}
            className={`flex-1 py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors ${
              !image || loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                正在分析...
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                开始 AI 分析
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-6">分析结果</h2>

        {result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Header */}
            <div className={`p-4 rounded-lg flex items-center gap-4 ${result.qualityCheck === '合格' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.qualityCheck === '合格' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {result.qualityCheck === '合格' ? <CheckCircle size={24} /> : <AlertOctagon size={24} />}
              </div>
              <div>
                <h3 className={`font-bold text-lg ${result.qualityCheck === '合格' ? 'text-green-800' : 'text-red-800'}`}>
                  质量检测: {result.qualityCheck}
                </h3>
                <p className={`text-sm ${result.qualityCheck === '合格' ? 'text-green-600' : 'text-red-600'}`}>
                  {result.qualityCheck === '合格' ? '物料符合 GMP 投料标准。' : '物料存在异常，建议人工复核。'}
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">识别物料</p>
                <p className="text-lg font-bold text-slate-900">{result.materialName}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">物理形态</p>
                <p className="text-lg font-bold text-slate-900">{result.detectedForm}</p>
              </div>
            </div>

            {/* Moisture Meter Visualization */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">预估含水量</p>
                <span className="text-xl font-bold text-blue-600">{result.estimatedMoisture}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(result.estimatedMoisture, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">标准范围: 10% - 14%</p>
            </div>

            {/* AI Reasoning */}
            <div className="mt-4">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                AI 推理依据
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed bg-white border border-slate-100 p-4 rounded-lg italic">
                "{result.reasoning}"
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-50">
            <UploadCloud size={48} className="mb-4" />
            <p>上传图片以查看分析结果</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;