/**
 * 隐私政策和用户协议配置
 * App Store 审核要求
 */

export const LEGAL_CONFIG = {
  // 隐私政策URL（上线前需替换为真实URL）
  privacyPolicyUrl: 'https://baoliao.im/privacy',
  
  // 用户协议URL
  termsOfServiceUrl: 'https://baoliao.im/terms',
  
  // 公司/开发者信息
  developer: {
    name: '包聊科技',
    email: 'support@baoliao.im',
    website: 'https://baoliao.im',
  },
  
  // 数据收集说明（App Store Connect 隐私标签需要）
  dataCollection: {
    // 收集的数据类型
    collectedData: [
      {
        type: 'Phone Number',
        purpose: 'Account registration and login',
        linked: true,
        tracking: false,
      },
      {
        type: 'User ID',
        purpose: 'App functionality',
        linked: true,
        tracking: false,
      },
      {
        type: 'Photos or Videos',
        purpose: 'Send media messages',
        linked: false,
        tracking: false,
      },
      {
        type: 'Audio Data',
        purpose: 'Voice messages and calls',
        linked: false,
        tracking: false,
      },
      {
        type: 'Device ID',
        purpose: 'Push notifications and device management',
        linked: true,
        tracking: false,
      },
    ],
    
    // 数据使用说明
    dataUsage: [
      'Account creation and authentication',
      'Enable messaging features',
      'Send push notifications',
      'Provide customer support',
      'Improve app performance',
    ],
    
    // 数据保护措施
    dataProtection: [
      'All data transmitted over HTTPS',
      'Passwords encrypted using bcrypt',
      'Messages stored securely on servers',
      'User can delete account and all data',
    ],
  },
  
  // 第三方SDK说明
  thirdPartySDKs: [
    {
      name: 'Expo',
      purpose: 'App development framework',
      dataCollected: ['Device information', 'Crash reports'],
    },
    {
      name: 'Apple Push Notification Service',
      purpose: 'Push notifications',
      dataCollected: ['Push token'],
    },
  ],
  
  // 联系方式
  contact: {
    email: 'privacy@baoliao.im',
    address: '中国',
  },
  
  // 版本信息
  version: '1.0',
  lastUpdated: '2026-01-27',
};

// 隐私政策文本（应用内展示）
export const PRIVACY_POLICY_TEXT = `
# 包聊隐私政策

更新日期：2026年1月27日
生效日期：2026年1月27日

## 1. 引言

包聊（"我们"或"本应用"）重视用户隐私。本隐私政策说明我们如何收集、使用、存储和保护您的个人信息。

## 2. 信息收集

我们收集以下类型的信息：

### 2.1 账户信息
- 手机号码（用于注册和登录）
- 用户ID（用于标识您的账户）

### 2.2 通讯内容
- 文字消息
- 图片和视频
- 语音消息

### 2.3 设备信息
- 设备标识符
- 操作系统版本
- 应用版本

## 3. 信息使用

我们使用收集的信息用于：
- 提供即时通讯服务
- 发送推送通知
- 改进应用性能
- 提供客户支持

## 4. 信息存储

- 您的数据存储在安全的服务器上
- 所有通信使用HTTPS加密
- 密码使用行业标准加密算法存储

## 5. 信息共享

我们不会向第三方出售您的个人信息。我们可能在以下情况下共享信息：
- 获得您的明确同意
- 法律要求

## 6. 您的权利

您有权：
- 访问您的个人数据
- 更正不准确的数据
- 删除您的账户和数据
- 导出您的数据

## 7. 儿童隐私

本应用不面向13岁以下儿童。我们不会故意收集儿童的个人信息。

## 8. 联系我们

如有隐私相关问题，请联系：
- 邮箱：privacy@baoliao.im

## 9. 政策更新

我们可能会更新本隐私政策。重大变更会通过应用内通知告知您。
`;

// 用户协议文本
export const TERMS_OF_SERVICE_TEXT = `
# 包聊用户协议

更新日期：2026年1月27日

## 1. 服务条款

欢迎使用包聊。使用本应用即表示您同意以下条款。

## 2. 账户

- 您必须提供真实的手机号码
- 您负责保护账户安全
- 不得共享或转让账户

## 3. 使用规则

您同意不会：
- 发送违法、有害或侮辱性内容
- 骚扰、威胁其他用户
- 传播垃圾信息
- 尝试破坏应用安全

## 4. 内容

- 您保留发送内容的所有权
- 您授权我们传输和存储您的内容
- 我们可能删除违规内容

## 5. 免责声明

- 服务按"现状"提供
- 我们不保证服务不间断

## 6. 终止

我们可能因违规行为终止您的账户。

## 7. 联系方式

support@baoliao.im
`;
