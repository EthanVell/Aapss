import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Order, Equipment, ProductionPlan, AIAnalysisResult, ProcessType } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// ------------------------------------------
// 1. AI Visual Perception Service
// ------------------------------------------

export const analyzeMaterialImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  const model = "gemini-2.5-flash"; 

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      materialName: { type: Type.STRING, description: "Identified name of the TCM material (in Chinese)" },
      detectedForm: { type: Type.STRING, description: "Physical form (e.g., 切片, 整根, 段, 粉末)" },
      estimatedMoisture: { type: Type.NUMBER, description: "Estimated moisture content percentage based on visual cues (0-100)" },
      qualityCheck: { type: Type.STRING, enum: ["合格", "不合格"], description: "Visual quality assessment" },
      reasoning: { type: Type.STRING, description: "Brief explanation of the analysis based on color, texture, and shape (in Chinese)." },
    },
    required: ["materialName", "detectedForm", "estimatedMoisture", "qualityCheck", "reasoning"],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "分析这张中药材图片。识别药材名称，形态（切片/整根等），根据表面纹理/颜色预估含水量，并检查是否存在视觉缺陷。请用中文回答。"
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return {
      materialName: "未知 (AI连接失败)",
      detectedForm: "未知",
      estimatedMoisture: 0,
      qualityCheck: "不合格",
      reasoning: "无法连接到AI服务，请检查API Key。",
    };
  }
};

// ------------------------------------------
// 2. AI Scheduling Optimization Service
// ------------------------------------------

export const generateProductionSchedules = async (
  orders: Order[],
  equipment: Equipment[]
): Promise<ProductionPlan[]> => {
  const model = "gemini-2.5-flash"; 

  // Define the output schema for the schedule
  const planSchema: Schema = {
    type: Type.ARRAY,
    description: "List of proposed production plans",
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        score: { type: Type.NUMBER, description: "0-100 score" },
        description: { type: Type.STRING, description: "Description in Chinese" },
        kpis: {
            type: Type.OBJECT,
            properties: {
                totalDurationHours: { type: Type.NUMBER },
                cleaningCycles: { type: Type.NUMBER },
                equipmentUtilization: { type: Type.NUMBER },
            }
        },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              orderId: { type: Type.STRING },
              equipmentId: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              processType: { type: Type.STRING, enum: Object.values(ProcessType) },
              notes: { type: Type.STRING, description: "Notes in Chinese" },
            },
            required: ["orderId", "equipmentId", "startTime", "endTime", "processType"],
          },
        },
      },
      required: ["id", "name", "description", "items", "kpis"],
    },
  };

  const prompt = `
    你是一个符合GMP规范的中药厂生产排程专家 AI。
    
    【输入数据】
    资源（设备）:
    ${JSON.stringify(equipment.map(e => ({ id: e.id, name: e.name, type: e.type, capacity: e.capacity })))}

    待处理订单 (包含AI视觉检测的含水量数据):
    ${JSON.stringify(orders.map(o => ({ 
      id: o.id, 
      material: o.material.name, 
      toxicity: o.material.toxicity, 
      qty: o.quantityKg, 
      deadline: o.deadline, 
      priority: o.priority,
      detectedMoisture: o.detectedMoisture || o.material.standardMoisture, // Use detected or standard
      standardMoisture: o.material.standardMoisture
    })))}

    【排产逻辑与约束】
    1. **GMP 合规（刚性约束）**：
       - 有毒药材（剧毒/小毒）在同一设备加工非毒性药材前，必须进行完整的清洁周期。
    2. **AI 工艺优化（动态调整）**：
       - **关键逻辑**：如果订单的 \`detectedMoisture\` (检测含水量) 高于 \`standardMoisture\` (标准含水量) 2% 以上，说明药材较湿，必须将该订单的【干燥】工序时长延长 20%。
    3. **效率优先**：尽量将相似物料组合在一起以减少清洗。
    4. **设备限制**：每批次不能超过设备容量。
    
    【任务目标】
    生成 2 个不同的排产方案（请使用中文回复）：
    方案 A: "AI 智能优化模式" - 根据检测到的含水量动态调整了干燥时长，并最大化利用率。
    方案 B: "GMP 严格合规模式" - 优先保证间隔时间和清洁批次，即使牺牲效率。

    假设当前时间是 2023-11-01 08:00。
    基础工艺参考：清洗 (2h) -> 蒸煮 (如果是根茎类, 4h) -> 干燥 (标准6h, 需根据含水量调整) -> 切制 (2h) -> 包装 (1h)。
    请严格返回 JSON 格式。
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ProductionPlan[];

  } catch (error) {
    console.error("Gemini Scheduling Error:", error);
    return [];
  }
};
