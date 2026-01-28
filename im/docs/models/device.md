# device 模型文档
模块位置：[src/models/device](../../../src/models/device)

## 基本信息
- 表名: "device"
- 模型: "Device"
- 时间戳: true
- 软删除: true

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | hook生成 | PRIMARY KEY | UUID 36位 |
| userId | 用户ID | string | 否 | 无 | BTREE | 引用 user.id |
| platform | 平台 | DevicePlatform | 否 | 无 | BTREE | ios/android/web/macos/windows |
| deviceId | 设备标识 | string | 否 | 无 | BTREE | 设备硬件标识，长度 ≤ 255 |
| deviceName | 设备名称 | string \| null | 是 | 无 |  | 如 "iPhone 15 Pro"，长度 ≤ 100 |
| pushToken | 推送令牌 | string \| null | 是 | 无 | BTREE | APNs/Expo/FCM token，长度 ≤ 500 |
| pushProvider | 推送提供商 | PushProvider \| null | 是 | 无 |  | apns/expo/fcm |
| appVersion | 应用版本 | string \| null | 是 | 无 |  | 如 "1.0.0"，长度 ≤ 20 |
| osVersion | 系统版本 | string \| null | 是 | 无 |  | 如 "iOS 17.0"，长度 ≤ 50 |
| isOnline | 是否在线 | boolean | 否 | false | BTREE |  |
| doNotDisturb | 勿扰模式 | boolean | 否 | false |  |  |
| lastActiveAt | 最后活跃时间 | Date \| null | 是 | 无 | BTREE |  |
| lastIp | 最后登录IP | string \| null | 是 | 无 |  | 长度 ≤ 50 |
| createdAt | 创建时间 | Date | 否 | 无 | BTREE |  |
| updatedAt | 更新时间 | Date | 否 | 无 |  |  |
| deletedAt | 删除时间 | Date \| null | 是 | 无 |  | paranoid 软删除 |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo | user | userId | User | 级联 | 级联 | 所属用户 |

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| DevicePlatform | IOS | "ios" | iOS 设备 |
| DevicePlatform | ANDROID | "android" | Android 设备 |
| DevicePlatform | WEB | "web" | Web 浏览器 |
| DevicePlatform | MACOS | "macos" | macOS 设备 |
| DevicePlatform | WINDOWS | "windows" | Windows 设备 |
| PushProvider | APNS | "apns" | Apple Push Notification service |
| PushProvider | EXPO | "expo" | Expo Push Notification |
| PushProvider | FCM | "fcm" | Firebase Cloud Messaging |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| DeviceAttributes | id | string |
| DeviceAttributes | userId | string |
| DeviceAttributes | platform | DevicePlatform |
| DeviceAttributes | deviceId | string |
| DeviceAttributes | deviceName | string \| null |
| DeviceAttributes | pushToken | string \| null |
| DeviceAttributes | pushProvider | PushProvider \| null |
| DeviceAttributes | appVersion | string \| null |
| DeviceAttributes | osVersion | string \| null |
| DeviceAttributes | isOnline | boolean |
| DeviceAttributes | doNotDisturb | boolean |
| DeviceAttributes | lastActiveAt | Date \| null |
| DeviceAttributes | lastIp | string \| null |

## DTO/白名单
- 列表字段: id, userId, platform, deviceName, isOnline, lastActiveAt, createdAt
- 详情字段: id, userId, platform, deviceId, deviceName, pushProvider, appVersion, osVersion, isOnline, doNotDisturb, lastActiveAt, lastIp, createdAt, updatedAt
- 可创建字段: userId, platform, deviceId, deviceName, pushToken, pushProvider, appVersion, osVersion
- 可更新字段: deviceName, pushToken, pushProvider, appVersion, osVersion, isOnline, doNotDisturb, lastActiveAt, lastIp
- 可筛选字段: userId, platform, isOnline, pushProvider
- 可排序字段: lastActiveAt, createdAt

## 钩子
- beforeCreate: 自动生成 UUID 作为 id
- afterUpdate: 当 isOnline 从 true 变为 false 时，更新 User.lastOnlineAt

## 索引
- `(userId, platform)` UNIQUE - 同用户同平台唯一设备
- `(userId, isOnline)` BTREE - 查询用户在线设备
- `(pushToken)` BTREE - 推送查询
- `(lastActiveAt)` BTREE - 清理过期设备
