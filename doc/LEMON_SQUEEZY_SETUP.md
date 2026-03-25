# Lemon Squeezy配置指南

## 📋 目标

配置Lemon Squeezy测试环境，用于本地开发测试支付流程。

---

## 1️⃣ 注册账号

1. 访问 https://lemonsqueezy.com/
2. 点击 **Sign up** 注册账号
3. 验证邮箱

---

## 2️⃣ 创建Store

首次登录会提示创建Store：

1. **Store name**: StoopKeep（或任意名称）
2. **Store URL**: stoopkeep（会变成 stoopkeep.lemonsqueezy.com）
3. **Currency**: USD
4. 点击 **Create store**

**记录Store ID**：
- Dashboard右上角可以看到Store ID
- 或者进入 Settings → General → Store ID
- 例如：`12345`

---

## 3️⃣ 切换到测试模式

**重要**：测试模式下的支付不会真实扣款！

1. Dashboard右上角有个开关：**Test mode**
2. 切换到 **Test mode: ON**
3. 看到橙色提示条：「You are in test mode」

---

## 4️⃣ 创建产品

### 产品1：月付

1. 左侧菜单 → **Products**
2. 点击 **+ New product**
3. 填写信息：
   - **Name**: StoopKeep Pro Monthly
   - **Description**: Unlimited tickets, properties, and exports
   - **Pricing**: 
     - Type: **Subscription**
     - Price: **$30.00**
     - Interval: **Monthly**
   - **Status**: Published
4. 点击 **Save product**
5. **记录Product ID**（例如：`123456`）

### 产品2：年付

重复上述步骤：
- **Name**: StoopKeep Pro Yearly
- **Price**: **$300.00**
- **Interval**: **Yearly**
- 记录Product ID（例如：`123457`）

---

## 5️⃣ 获取API密钥

1. 左侧菜单 → **Settings** → **API**
2. 点击 **+ Create API key**
3. 填写信息：
   - **Name**: Local Development
   - **Permissions**: 保持默认（Full access）
4. 点击 **Create**
5. **复制API key**（只显示一次！）
   - 格式：`eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...`

---

## 6️⃣ 配置Webhook（可选，本地测试可跳过）

用于接收支付事件通知（订阅创建、取消等）。

### 本地测试（使用ngrok）

```bash
# 安装ngrok
brew install ngrok

# 启动Next.js（端口3000）
npm run dev

# 新终端：启动ngrok
ngrok http 3000

# 复制ngrok URL（例如：https://abc123.ngrok.io）
```

### 配置Webhook

1. Settings → **Webhooks**
2. 点击 **+ Add endpoint**
3. 填写信息：
   - **URL**: `https://abc123.ngrok.io/api/webhooks/lemon-squeezy`
   - **Events**: 选择以下事件
     - ✅ order_created
     - ✅ subscription_created
     - ✅ subscription_updated
     - ✅ subscription_cancelled
     - ✅ subscription_expired
4. 点击 **Save**
5. **复制Signing secret**（例如：`whsec_xxx`）

**注意**：线上环境使用真实域名：
```
https://stoopkeep.com/api/webhooks/lemon-squeezy
```

---

## 7️⃣ 更新 .env.local

将获取的信息填入 `.env.local`:

```bash
# Lemon Squeezy（测试模式）
LEMON_SQUEEZY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_xxx（如果配置了webhook）
LEMON_SQUEEZY_STORE_ID=12345
LEMON_SQUEEZY_PRODUCT_ID_MONTHLY=123456
LEMON_SQUEEZY_PRODUCT_ID_YEARLY=123457
```

---

## 8️⃣ 测试支付流程

### 在代码中创建Checkout

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { variantId } = await req.json();
  
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            custom: {
              user_id: 'user_123'
            }
          }
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMON_SQUEEZY_STORE_ID
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId
            }
          }
        }
      }
    })
  });
  
  const data = await response.json();
  return NextResponse.json({ url: data.data.attributes.url });
}
```

### 前端调用

```typescript
// 用户点击"Upgrade to Pro"
const response = await fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({
    variantId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_MONTHLY
  })
});

const { url } = await response.json();
window.location.href = url;  // 跳转到Lemon Squeezy支付页面
```

### 测试支付

1. 点击"Upgrade to Pro"按钮
2. 跳转到Lemon Squeezy支付页面
3. 使用测试卡号：
   - **卡号**: `4242 4242 4242 4242`
   - **过期日期**: 任意未来日期（例如：12/28）
   - **CVC**: 任意3位数（例如：123）
   - **ZIP**: 任意（例如：10001）
4. 点击支付
5. **不会真实扣款！**
6. 支付成功后跳转回你的应用

---

## 9️⃣ 验证订阅状态

### 接收Webhook事件

```typescript
// app/api/webhooks/lemon-squeezy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-signature');
  
  // 验证签名
  const hmac = crypto.createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!);
  const digest = hmac.update(body).digest('hex');
  
  if (digest !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  // 处理事件
  switch (event.meta.event_name) {
    case 'subscription_created':
      // 更新数据库：用户订阅成功
      console.log('Subscription created:', event.data);
      break;
    case 'subscription_cancelled':
      // 更新数据库：用户取消订阅
      console.log('Subscription cancelled:', event.data);
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

---

## 🔟 查看测试数据

1. Dashboard → **Orders**（订单列表）
2. Dashboard → **Subscriptions**（订阅列表）
3. 可以看到所有测试支付记录
4. 可以手动取消订阅测试

---

## 📊 测试场景

### 场景1：新用户订阅
1. 用户注册账号
2. 点击"Upgrade to Pro"
3. 选择月付/年付
4. 完成支付
5. Webhook接收 `subscription_created` 事件
6. 更新数据库：`subscription_status = 'active'`
7. 用户可以使用Pro功能

### 场景2：取消订阅
1. Dashboard手动取消订阅
2. Webhook接收 `subscription_cancelled` 事件
3. 更新数据库：`subscription_status = 'cancelled'`
4. 用户失去Pro权限

### 场景3：订阅续费
1. 到期自动续费（测试模式不会真实扣款）
2. Webhook接收 `subscription_updated` 事件
3. 更新数据库：`subscription_end_date` 延长

---

## ✅ Checklist

- [ ] 注册Lemon Squeezy账号
- [ ] 创建Store
- [ ] 切换到测试模式
- [ ] 创建产品（月付 + 年付）
- [ ] 获取API密钥
- [ ] 配置Webhook（可选）
- [ ] 更新.env.local
- [ ] 测试支付流程
- [ ] 验证Webhook接收

---

## 🚀 线上环境切换

切换到生产环境时：

1. **关闭测试模式**：Dashboard → Test mode: OFF
2. **重新创建产品**（测试产品不能用于生产）
3. **获取生产API key**
4. **配置生产Webhook URL**
5. 更新Vercel环境变量

**环境对照**：

| 项目 | 测试环境 | 生产环境 |
|------|---------|---------|
| Test mode | ON | OFF |
| API key | test_xxx | live_xxx |
| Webhook URL | ngrok URL | stoopkeep.com |
| 支付 | 不扣款 | 真实扣款 |

---

## 📞 需要帮助？

- Lemon Squeezy文档: https://docs.lemonsqueezy.com/
- API文档: https://docs.lemonsqueezy.com/api
- Webhook文档: https://docs.lemonsqueezy.com/guides/webhooks
