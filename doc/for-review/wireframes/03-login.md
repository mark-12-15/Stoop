# 03. 登录页面

**路由**: `/login`  
**访问**: 公开

---

## 3A. 登录页面（主界面）

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                            │
├─────────────────────────────────────────────┤
│                                             │
│         Sign in to StoopKeep                 │
│                                             │
│  ┌─────────────────────────────┐           │
│  │  [G] Continue with Google   │           │
│  └─────────────────────────────┘           │
│                                             │
│  ┌─────────────────────────────┐           │
│  │  [] Continue with Apple     │           │
│  └─────────────────────────────┘           │
│                                             │
│           ── OR ──                          │
│                                             │
│  ┌─────────────────────────────┐           │
│  │ Email address               │           │
│  └─────────────────────────────┘           │
│                                             │
│  [ Send Login Link ]                        │
│                                             │
│  💡 New here? We'll create your account     │
│     automatically on first sign in.         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 3B. Magic Link发送成功页面

点击[Send Login Link]后：

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                            │
├─────────────────────────────────────────────┤
│                                             │
│         ✉️ Check Your Email                 │
│                                             │
│  We sent a login link to:                  │
│  john@example.com                           │
│                                             │
│  Click the link in your email to sign in.  │
│  The link expires in 1 hour.               │
│                                             │
│  ─────────────────────────────             │
│                                             │
│  Didn't receive the email?                  │
│  • Check your spam folder                   │
│  • [Resend Link] (available in 60s)        │
│                                             │
│  [ ← Back to Login ]                        │
│                                             │
└─────────────────────────────────────────────┘
```

**倒计时逻辑**:
- 60秒内[Resend Link]按钮禁用
- 显示倒计时："Resend available in 45s"
- 60秒后启用按钮

---

## 3C. OAuth授权流程

点击OAuth按钮后（弹窗/跳转）：

```
用户点击[Continue with Google]
    ↓
打开Google授权页面（新窗口）
    ↓
用户授权成功
    ↓
关闭窗口，自动跳转到 /dashboard
```

**OAuth失败处理**:
```
用户取消授权 → 返回/login → Toast: "Login cancelled"
网络错误 → 返回/login → Toast: "Connection failed. Please try again."
```

---

## 组件

- `LoginPage` - 主登录页面
- `MagicLinkSentPage` - 邮件发送成功页面
- `OAuthButtons` - OAuth按钮组（Google/Apple）
- `EmailLoginForm` - 邮箱输入表单

---

## API

Supabase Auth（内置）：
- Google OAuth
- Apple OAuth
- Email Magic Link

---

## 实现示例

```typescript
// OAuth登录
const handleOAuthLogin = async (provider: 'google' | 'apple') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  
  if (error) {
    toast.error(`${provider} login failed. Please try again.`);
  }
};

// Magic Link登录
const handleMagicLinkLogin = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`
    }
  });
  
  if (error) {
    toast.error('Failed to send login link. Please try again.');
  } else {
    router.push('/login/check-email');
  }
};

// 页面加载时检查session（30天免登录）
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // 已登录，直接跳转
      router.push('/dashboard');
    }
  };
  
  checkSession();
}, []);
```

---

## Session管理

```typescript
// Supabase配置（Dashboard设置）
JWT Expiry: 3600 seconds (1 hour)
Refresh Token Expiry: 2592000 seconds (30 days)

// 自动刷新机制
Supabase会在Access Token过期前自动用Refresh Token刷新
用户30天内无需重新登录
```

---

## 安全机制

1. ✅ **Access Token**: 1小时过期（短期，更安全）
2. ✅ **Refresh Token**: 30天过期（长期免登录）
3. ✅ **Magic Link**: 1小时过期（防止邮件泄露）
4. ✅ **HTTPS Only**: Cookie设置为Secure

---

## 邮件成本

- 使用Resend免费版（3000封/月）
- 30天免登录 → 减少90%登录次数
- MVP阶段完全够用（支持1000+用户）

---

## 用户体验流程

| 场景 | 流程 | 是否需要邮件 |
|------|------|------------|
| **首次登录（OAuth）** | 点击Google → 授权 → 跳转Dashboard | ❌ 不需要 |
| **首次登录（Email）** | 输入邮箱 → 收邮件 → 点击链接 → Dashboard | ✅ 需要1封 |
| **30天内再次访问** | 访问/login → 自动跳转Dashboard | ❌ 不需要 |
| **31天后访问** | Session过期 → 重新登录 | ✅ 需要1封 |
