# Gemini Prompt Engineering

**Model**: Gemini 1.5 Flash  
**Usage**: 
1. Analyze tenant repair descriptions (text analysis)
2. Extract receipt information from photos (OCR)

**Why Gemini Flash 1.5**:
- ✅ Cost-effective: Much cheaper than GPT-4 Vision
- ✅ Fast response: ~1 second
- ✅ Multimodal: Text + image in one call
- ✅ Large context: 1M tokens

**⚠️ Important Notes**:
- **Consistency issues**: Same prompt may give different results
- **Mitigation strategies**:
  - Use low temperature (0.2)
  - Force JSON Schema output
  - Retry 3 times on failure
  - Human review for critical data

---

## Prompt 1: 分析维修工单

### System Prompt（完整版，直接复制使用）

```text
You are a property maintenance assistant with expertise in residential repair triage. Your job is to analyze tenant repair requests and extract structured information to help landlords make quick decisions.

Output a valid JSON object with exactly these fields:
{
  "category": string,
  "severity": string,
  "summary": string,
  "is_emergency": boolean,
  "suggested_action": string
}

## Field Definitions:

### category (must be one of these exact values):
- "plumbing": Water-related issues (leaks, clogs, toilets, sinks, water heaters)
- "electrical": Electrical issues (outlets, lights, circuit breakers, wiring)
- "appliance": Broken appliances (refrigerator, dishwasher, washer, dryer, stove)
- "hvac": Heating/cooling issues (furnace, AC, thermostat, vents)
- "structural": Building structure (roof leaks, walls, floors, windows, doors)
- "pest": Pest infestations (rodents, insects, bed bugs)
- "locksmith": Lock or key issues (locked out, broken locks, lost keys)
- "other": Anything else

### severity (must be one of these exact values):
- "high": Immediate safety risk or major property damage risk
- "medium": Needs attention soon but not an immediate emergency
- "low": Minor issue that can wait a few days

#### HIGH severity indicators:
- Gas leak or gas smell
- No heat in winter (below 60°F outside)
- No AC in summer (above 90°F outside)
- Burst pipe or major flooding
- Electrical sparks or burning smell
- Sewage backup
- Broken exterior door or window security
- No hot water in winter
- Carbon monoxide detector beeping

#### MEDIUM severity indicators:
- Leaking faucet or slow leak
- Clogged drain
- Broken appliance affecting daily life
- AC not cooling well
- Minor roof leak
- Toilet running constantly
- Water heater making noise

#### LOW severity indicators:
- Cosmetic issues (paint, scratches)
- Minor drips
- Squeaky hinges
- Light bulb out
- Slow drain (still draining)
- Minor pest sighting (single bug)

### summary:
Write a concise, professional one-sentence summary (max 80 characters) that a landlord can quickly scan. Focus on WHAT and WHERE, not on tenant's emotions.

Example good summaries:
- "Kitchen sink pipe leaking slowly under cabinet"
- "Living room circuit breaker tripping repeatedly"
- "No hot water, water heater not heating"
- "Front door lock jammed, can't lock door"

Example bad summaries:
- "Tenant is very upset about water everywhere" (too vague)
- "The thing in the kitchen is broken" (not specific)

### is_emergency:
Set to true if this requires immediate action (within 2 hours) to prevent:
- Health/safety hazard
- Major property damage
- Tenant being unable to access/secure the unit

### suggested_action:
A brief recommendation (max 60 characters) on what type of professional is needed or if landlord can DIY.

Examples:
- "Call licensed plumber"
- "Call electrician immediately"
- "DIY: Replace air filter"
- "Call locksmith"
- "Schedule HVAC technician"
- "Call appliance repair"
- "Inspect and call roofer if needed"

## Important rules:
1. Be conservative with "high" severity - only for true emergencies
2. If tenant description is vague, ask for more info in your analysis
3. If tenant marked it as emergency but it's not, correct the severity
4. Always provide specific, actionable guidance
5. If there are multiple issues, focus on the most urgent one
```

### User Prompt Template

```typescript
const userPrompt = `
Tenant description: "${ticket.tenant_raw_text}"

${ticket.tenant_name ? `Tenant name: ${ticket.tenant_name}` : ''}

${ticket.is_emergency ? '⚠️ Tenant marked this as EMERGENCY.' : ''}

${ticket.tenant_photo_urls?.length > 0 
  ? `Photos attached: ${ticket.tenant_photo_urls.length} photo(s) provided` 
  : 'No photos provided - may need to ask tenant for photos'}

Additional context:
- Current season: ${getCurrentSeason()}
- Location: ${getPropertyLocation() || 'USA'}
`.trim();
```

### 完整调用代码

```typescript
// lib/ai/analyze-ticket.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface TicketAnalysis {
  category: 'plumbing' | 'electrical' | 'appliance' | 'hvac' | 'structural' | 'pest' | 'locksmith' | 'other';
  severity: 'high' | 'medium' | 'low';
  summary: string;
  is_emergency: boolean;
  suggested_action: string;
}

export async function analyzeTicket(ticket: {
  tenant_raw_text: string;
  tenant_name?: string;
  is_emergency?: boolean;
  tenant_photo_urls?: string[];
  property_location?: string;
}): Promise<TicketAnalysis> {
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.3, // 低温度 = 更稳定的输出
      maxOutputTokens: 300,
      responseMimeType: 'application/json' // 强制JSON输出
    }
  });
  
  const systemPrompt = `[复制上面的完整 System Prompt]`;
  
  const userPrompt = `
Tenant description: "${ticket.tenant_raw_text}"

${ticket.tenant_name ? `Tenant name: ${ticket.tenant_name}` : ''}

${ticket.is_emergency ? '⚠️ Tenant marked this as EMERGENCY.' : ''}

${ticket.tenant_photo_urls?.length > 0 
  ? `Photos attached: ${ticket.tenant_photo_urls.length} photo(s) provided` 
  : 'No photos provided'}
  `.trim();

  try {
    const result = await model.generateContent([
      systemPrompt,
      userPrompt
    ]);
    
    const response = result.response;
    const text = response.text();
    const parsed = JSON.parse(text);
    
    // 验证输出格式
    if (!parsed.category || !parsed.severity || !parsed.summary) {
      throw new Error('Invalid AI response format');
    }
    
    return parsed as TicketAnalysis;
    
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // 降级方案：返回保守的默认值
    return {
      category: 'other',
      severity: 'medium',
      summary: 'Unable to analyze automatically, needs manual review',
      is_emergency: ticket.is_emergency || false,
      suggested_action: 'Review tenant description and photos'
    };
  }
}
```

### 测试用例

```typescript
// __tests__/ai/analyze-ticket.test.ts
import { analyzeTicket } from '@/lib/ai/analyze-ticket';

describe('Ticket Analysis', () => {
  it('should identify plumbing emergency', async () => {
    const result = await analyzeTicket({
      tenant_raw_text: 'Water is flooding from the bathroom ceiling! It wont stop!',
      is_emergency: true
    });
    
    expect(result.category).toBe('plumbing');
    expect(result.severity).toBe('high');
    expect(result.is_emergency).toBe(true);
    expect(result.suggested_action).toContain('plumber');
  });
  
  it('should identify non-emergency appliance issue', async () => {
    const result = await analyzeTicket({
      tenant_raw_text: 'The dishwasher is making a weird noise but still works',
      is_emergency: false
    });
    
    expect(result.category).toBe('appliance');
    expect(result.severity).toBe('low');
    expect(result.is_emergency).toBe(false);
  });
  
  it('should correct tenant overreaction', async () => {
    const result = await analyzeTicket({
      tenant_raw_text: 'EMERGENCY!!! The living room light bulb is out!',
      is_emergency: true
    });
    
    expect(result.severity).toBe('low');
    expect(result.is_emergency).toBe(false); // AI 应该纠正
  });
});
```

---

## Prompt 2: 提取收据信息（OCR）

### System Prompt

```text
You are a receipt data extraction assistant. Extract information from receipt photos to help landlords track maintenance expenses for tax purposes.

Output a valid JSON object with exactly these fields:
{
  "total_amount": number or null,
  "date": string or null,
  "vendor_name": string or null,
  "confidence": "high" | "medium" | "low",
  "notes": string
}

## Field Definitions:

### total_amount:
- Extract the final TOTAL amount paid (not subtotal, not tip, not tax separately)
- Return as a number (e.g., 150.00, not "$150.00")
- If there are multiple amounts, choose the largest one labeled "Total" or "Amount Due"
- If you cannot confidently determine the total, return null

### date:
- Extract the date in YYYY-MM-DD format
- Common date positions: top of receipt, near vendor name, or at bottom
- If you see "12/15/2024", convert to "2024-12-15"
- If date is unclear or missing, return null

### vendor_name:
- Extract the business/vendor name (usually at the top)
- Examples: "Home Depot", "Joe's Plumbing", "ABC Hardware"
- If not visible, return null

### confidence:
- "high": Receipt is clear, all fields are clearly visible
- "medium": Some blur or poor lighting, but main fields are readable
- "low": Very blurry, handwritten, or key information missing

### notes:
- Brief explanation of any issues or ambiguities
- Examples:
  - "Receipt is blurry, amounts may be inaccurate"
  - "Multiple totals found, selected the larger one"
  - "Date partially obscured"
  - "Clear receipt, all info extracted"

## Important rules:
1. NEVER fabricate or guess numbers - if unclear, return null
2. Be conservative with confidence ratings
3. If the image is not a receipt (e.g., just a photo of a broken pipe), return all null with confidence "low"
4. Handwritten receipts should default to "medium" or "low" confidence
```

### 完整调用代码

```typescript
// lib/ai/extract-receipt.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ReceiptData {
  total_amount: number | null;
  date: string | null; // YYYY-MM-DD format
  vendor_name: string | null;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

export async function extractReceipt(imageUrl: string): Promise<ReceiptData> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.1, // 极低温度 = 最稳定输出
      maxOutputTokens: 200,
      responseMimeType: 'application/json'
    }
  });
  
  const systemPrompt = `[复制上面的完整 System Prompt]`;
  
  try {
    // 下载图片并转为base64
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: base64,
          mimeType: 'image/jpeg'
        }
      }
    ]);
    
    const text = result.response.text();
    const parsed = JSON.parse(text);
    
    return {
      total_amount: parsed.total_amount,
      date: parsed.date,
      vendor_name: parsed.vendor_name,
      confidence: parsed.confidence || 'low',
      notes: parsed.notes || ''
    };
    
  } catch (error) {
    console.error('Receipt extraction error:', error);
    
    return {
      total_amount: null,
      date: null,
      vendor_name: null,
      confidence: 'low',
      notes: 'Failed to process image - please enter manually'
    };
  }
}
```

### 前端集成（关键：预填 + 人工确认）

```tsx
// components/CostInputModal.tsx
import { useState, useEffect } from 'react';
import { extractReceipt } from '@/lib/ai/extract-receipt';

export function CostInputModal({ ticketId, onClose, onSave }) {
  const [cost, setCost] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleReceiptUpload = async (file: File) => {
    setReceiptFile(file);
    setIsProcessing(true);
    
    // 先上传文件到临时位置
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch('/api/upload-temp', {
      method: 'POST',
      body: formData
    });
    const { url } = await uploadRes.json();
    
    // 调用 AI 提取
    const extracted = await extractReceipt(url);
    setAiData(extracted);
    
    // 如果 AI 有信心，预填金额
    if (extracted.confidence !== 'low' && extracted.total_amount) {
      setCost(extracted.total_amount.toString());
    }
    
    setIsProcessing(false);
  };
  
  return (
    <div className="modal">
      <h3>Add Final Cost</h3>
      
      {/* 上传收据 */}
      <div className="mb-4">
        <label>Upload Receipt (optional but recommended)</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleReceiptUpload(e.target.files[0])}
        />
        {isProcessing && <p>🤖 AI is reading the receipt...</p>}
      </div>
      
      {/* AI 提取结果 */}
      {aiData && (
        <div className={`ai-result ${aiData.confidence === 'low' ? 'warning' : 'success'}`}>
          <p><strong>AI extracted:</strong></p>
          <p>Amount: ${aiData.total_amount || 'N/A'}</p>
          <p>Date: {aiData.date || 'N/A'}</p>
          <p>Vendor: {aiData.vendor_name || 'N/A'}</p>
          <p className="text-sm text-gray-600">{aiData.notes}</p>
          
          {aiData.confidence === 'low' && (
            <div className="warning-box">
              ⚠️ AI is not confident. Please verify the amount carefully.
            </div>
          )}
        </div>
      )}
      
      {/* 手动输入金额（必填） */}
      <div className="mb-4">
        <label>Final Cost*</label>
        <input 
          type="number" 
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="150.00"
          required
          className={aiData && aiData.confidence === 'low' ? 'border-yellow-500' : ''}
        />
        <p className="text-sm text-gray-500">
          {aiData?.total_amount && aiData.confidence !== 'low' 
            ? '✅ AI pre-filled this value. Please verify before saving.'
            : 'Enter the actual amount you paid'}
        </p>
      </div>
      
      {/* 保存按钮 */}
      <div className="flex gap-2">
        <button onClick={onClose}>Cancel</button>
        <button 
          onClick={() => onSave({ cost: parseFloat(cost), receiptFile })}
          disabled={!cost || parseFloat(cost) <= 0}
          className="primary"
        >
          Save & Close Ticket
        </button>
      </div>
    </div>
  );
}
```

---

## 成本优化

### 价格估算（2025-03）

**Gemini 1.5 Flash 定价**:

| 层级 | 价格 | 限制 |
|------|------|------|
| **Free** | $0 | 1500次请求/天<br>15 RPM（每分钟15次） |
| **Pay-as-you-go** | Input: $0.075 / 1M tokens<br>Output: $0.30 / 1M tokens | 2000 RPM |

**场景 A: 分析维修工单（纯文本）**
```
Input: 约 800 tokens (System Prompt + User Prompt)
Output: 约 100 tokens (JSON response)
Cost: $0.000090 每次

1000 个工单 = $0.09（付费情况下）
Free tier: 1500次/天 = 45000次/月（完全够用！）
```

**场景 B: 提取收据（带图片）**
```
Input: 约 600 tokens + 图片处理
Output: 约 80 tokens
Cost: 约 $0.000019 每次

1000 张收据 = $0.019（付费情况下）
Free tier: 1500次/天 = 45000次/月
```

**月度成本预估**:

| 用户规模 | 工单数/月 | 收据数/月 | 是否免费 | 成本 |
|---------|----------|----------|---------|------|
| **100用户** | 500 | 1000 | ✅ 免费额度内 | **$0** |
| **1000用户** | 5000 | 10000 | ✅ 免费额度内 | **$0** |
| **5000用户** | 25000 | 50000 | ⚠️ 超出免费 | **$0.47/月** |
| **10000用户** | 50000 | 100000 | ❌ 需付费 | **$0.94/月** |

**对比GPT-4o-mini**:
- 1000用户场景：Gemini $0 vs GPT-4o-mini $0.48
- 10000用户场景：Gemini $0.94 vs GPT-4o-mini $4.80
- **省钱**: 80-100%

**结论**: 
- MVP阶段（<1000用户）：完全免费
- 成长阶段：成本可忽略不计（$1/月）
- 远低于数据库($25)和部署($20)成本

---

## 降级策略

### 当 Gemini API 不可用时

```typescript
export async function analyzeTicketWithFallback(ticket: any): Promise<TicketAnalysis> {
  try {
    // 先尝试 AI 分析
    return await analyzeTicket(ticket);
  } catch (error) {
    console.error('Gemini API failed, using fallback:', error);
    
    // 降级：基于关键词的简单分类
    const text = ticket.tenant_raw_text.toLowerCase();
    
    let category: any = 'other';
    if (text.includes('water') || text.includes('leak') || text.includes('pipe')) {
      category = 'plumbing';
    } else if (text.includes('electric') || text.includes('light') || text.includes('outlet')) {
      category = 'electrical';
    } else if (text.includes('heat') || text.includes('ac') || text.includes('air')) {
      category = 'hvac';
    } else if (text.includes('fridge') || text.includes('stove') || text.includes('washer')) {
      category = 'appliance';
    }
    
    return {
      category,
      severity: ticket.is_emergency ? 'high' : 'medium',
      summary: `${category} issue - AI unavailable, needs manual review`,
      is_emergency: ticket.is_emergency || false,
      suggested_action: 'Review tenant description manually'
    };
  }
}
```

---

## 监控和调试

### 日志记录

```typescript
// lib/ai/logger.ts
export async function logAIAnalysis(ticketId: string, input: any, output: any, error?: any) {
  const log = {
    ticket_id: ticketId,
    timestamp: new Date().toISOString(),
    model: 'gemini-1.5-flash',
    input_length: input.length,
    output,
    error: error?.message,
    // Gemini成本太低，几乎可以忽略，不需要精确计算
    cost_estimate: 0.000019 // 固定估算
  };
  
  // MVP阶段可以不记录，成本太低不值得
  // 如果需要调试，使用console.log或Sentry即可
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI Analysis]', log);
  }
}
```

### 质量监控

定期检查 AI 输出质量：
1. 每周随机抽取 10 个工单，人工验证 AI 分类是否正确
2. 如果准确率 < 85%，调整 System Prompt
3. 收集房东反馈："AI 分析不准确"按钮

---

## 环境配置

### 安装依赖

```bash
npm install @google/generative-ai
```

### 环境变量配置

**`.env.local`**:
```bash
# Gemini API
GEMINI_API_KEY=AIzaSy...  # 从 https://aistudio.google.com/app/apikey 获取

# Gemini配置（可选）
GEMINI_MODEL=gemini-1.5-flash  # 默认模型
GEMINI_TEMPERATURE=0.3          # 默认温度
```

### 获取Gemini API Key

1. 访问 https://aistudio.google.com/app/apikey
2. 点击 "Create API Key"
3. 选择项目（或创建新项目）
4. 复制生成的API Key
5. 粘贴到 `.env.local`

**免费额度**:
- 1500次请求/天
- 15 RPM（每分钟15次请求）
- 150万tokens/天
- **无需信用卡**

---

## 完整技术栈

```yaml
AI模型: Gemini 1.5 Flash
  - 文本分析: 分类工单、判断严重性
  - 图像识别: OCR提取收据信息
  - 成本: $0/月（免费额度内）
  
依赖包:
  - @google/generative-ai: ^0.21.0
  
配置:
  - API Key: 从Google AI Studio获取
  - 无需信用卡绑定
  - 免费额度足够MVP使用
```

---

## 迁移指南（如需从GPT-4o-mini迁移）

如果之前使用OpenAI，迁移到Gemini只需3步：

**1. 安装新依赖**
```bash
npm install @google/generative-ai
npm uninstall openai
```

**2. 更新环境变量**
```bash
# 删除
# OPENAI_API_KEY=sk-xxx

# 添加
GEMINI_API_KEY=AIzaSy...
```

**3. 替换代码**
```typescript
// 旧代码（OpenAI）
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 新代码（Gemini）
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
```

---

**下一步**: 查看 `deployment.md` 了解如何部署到生产环境
