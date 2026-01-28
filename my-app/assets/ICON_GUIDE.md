# 图标和启动屏资源指南

## 必需资源

### 1. App Icon (icon.png)
- 尺寸: 1024x1024 像素
- 格式: PNG (无透明度)
- 用途: App Store 和主屏幕图标

### 2. Adaptive Icon (adaptive-icon.png) - Android
- 尺寸: 1024x1024 像素
- 格式: PNG (可带透明度)
- 注意: 内容应在中心 512x512 区域

### 3. Splash Icon (splash-icon.png)
- 尺寸: 288x288 像素 (推荐)
- 格式: PNG (可带透明度)
- 用途: 启动屏中心图标

### 4. Favicon (favicon.png) - Web
- 尺寸: 48x48 像素
- 格式: PNG

## 设计规范

### 品牌色
- 主色: #007AFF (iOS蓝)
- 背景: #FFFFFF (白色)
- 图标建议使用简洁的聊天气泡设计

### App Store 截图尺寸 (iPhone)
- 6.7" (iPhone 15 Pro Max): 1290 x 2796
- 6.5" (iPhone 14 Plus): 1284 x 2778
- 5.5" (iPhone 8 Plus): 1242 x 2208

### App Store 截图尺寸 (iPad)
- 12.9" (iPad Pro): 2048 x 2732

## 生成工具

推荐使用以下工具生成多尺寸图标:
1. Figma / Sketch - 设计原始图标
2. https://appicon.co - 自动生成所有尺寸
3. https://easyappicon.com - App图标生成器

## 当前占位符

项目已包含 Expo 默认图标，上架前请替换为正式设计的图标。

## SVG 图标模板

可使用以下 SVG 作为设计基础:

```svg
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="1024" height="1024" fill="#007AFF"/>
  
  <!-- 圆角矩形背景 (可选) -->
  <rect x="64" y="64" width="896" height="896" rx="200" fill="#FFFFFF"/>
  
  <!-- 聊天气泡图标 -->
  <path d="M512 256C352 256 224 368 224 512C224 592 264 664 328 712L296 816L424 760C448 768 480 776 512 776C672 776 800 664 800 520C800 376 672 256 512 256Z" 
        fill="#007AFF"/>
  
  <!-- 三个点 -->
  <circle cx="400" cy="520" r="32" fill="#FFFFFF"/>
  <circle cx="512" cy="520" r="32" fill="#FFFFFF"/>
  <circle cx="624" cy="520" r="32" fill="#FFFFFF"/>
</svg>
```

## 文件检查清单

- [ ] assets/icon.png (1024x1024)
- [ ] assets/adaptive-icon.png (1024x1024)
- [ ] assets/splash-icon.png (288x288)
- [ ] assets/favicon.png (48x48)
- [ ] App Store 截图 (至少3张)
- [ ] App 预览视频 (可选)
