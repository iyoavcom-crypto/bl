# Node.js 爬虫系统

## Term（术语）
Node.js 爬虫系统 (Node.js Crawler System)

## Domain（所属领域）
爬虫采集 (Web Scraping & Crawling)

## Definition（标准定义）
Node.js 爬虫系统是指基于 **Node.js** 运行时环境构建的，用于自动化获取、解析、处理和存储互联网数据的分布式或单体软件架构。该系统利用 Node.js 的 **事件驱动 (Event-driven)** 和 **非阻塞 I/O (Non-blocking I/O)** 模型，能够高效处理大规模并发网络请求，特别适用于数据密集型（Data-intensive）和实时性要求较高的采集场景。

## Core Characteristics（核心特征）
1.  **高并发网络处理 (High Concurrency Networking)**：
    得益于 libuv 提供的异步 I/O 能力，Node.js 单线程即可处理数千个并发连接，在处理 HTTP 请求/响应等网络密集型任务时资源消耗低且吞吐量大。

2.  **同构语言优势 (Isomorphic Language Advantage)**：
    采集端与目标网页均使用 **JavaScript**，在处理 **动态渲染 (Client-side Rendering, CSR)** 页面时具有天然优势。能够无缝集成 **无头浏览器 (Headless Browser)**（如 Puppeteer, Playwright）进行 DOM 操作和脚本执行。

3.  **丰富的生态系统 (Rich Ecosystem)**：
    NPM (Node Package Manager) 拥有庞大的第三方库支持，涵盖 HTTP 客户端 (Axios, Got)、HTML 解析 (Cheerio, JSDOM)、任务队列 (Bull, Agenda) 及代理管理等全链路组件。

4.  **流式处理 (Stream Processing)**：
    Node.js 的 Stream API 允许数据在传输过程中被分块处理，无需将整个文件加载到内存，适合处理大文件下载或大规模数据清洗。

## Typical Use Cases（典型使用场景）
1.  **动态单页应用采集 (SPA Scraping)**：
    针对 React, Vue, Angular 等框架构建的网站，需要执行 JavaScript 才能获取数据的场景。Node.js 可直接控制 Chrome DevTools Protocol (CDP) 进行深度交互（点击、滚动、截图）。

2.  **实时数据监控 (Real-time Monitoring)**：
    如电商价格监控、库存状态追踪、社交媒体舆情监听。利用 WebSocket 或长轮询机制，配合 Node.js 的高并发特性实现低延迟数据更新。

3.  **API 数据聚合 (API Aggregation)**：
    绕过前端页面，直接逆向工程调用后端 API 接口，利用 Node.js 快速构建中间层服务，清洗并聚合多源数据。

4.  **服务端渲染预取 (SSR Pre-rendering)**：
    在构建搜索引擎优化 (SEO) 友好的应用时，利用爬虫系统预先抓取页面并生成静态内容。

## Related Concepts（相关概念）
*   **Headless Browser (无头浏览器)**：无图形用户界面的浏览器环境，用于在服务器端模拟真实用户行为，是 Node.js 爬虫处理动态页面的核心组件。
*   **Event Loop (事件循环)**：Node.js 的核心运行机制，理解其工作原理对于优化爬虫的并发控制和避免主线程阻塞至关重要。
*   **Rate Limiting (速率限制)**：用于控制请求频率以规避目标服务器的反爬虫机制，通常结合 Redis 等中间件实现。
*   **User-Agent Rotation (UA 轮换)**：伪造不同的浏览器身份信息，降低被识别为机器人的风险。

## Common Misunderstandings（常见误解）
*   **误解 1：Node.js 无法处理 CPU 密集型任务，因此不适合做爬虫**。
    *   **澄清**：虽然 Node.js 主线程不适合繁重的计算，但爬虫的主要瓶颈在于网络 I/O。对于解析和清洗环节的 CPU 消耗，可以通过 **Worker Threads**、子进程或将计算密集型任务卸载到微服务架构中的其他语言服务（如 Go, Rust, Python）来解决。
*   **误解 2：简单的 HTTP 请求脚本就是爬虫系统**。
    *   **澄清**：系统 (System) 意味着具备完整的生命周期管理，包括 **任务调度 (Scheduling)**、**去重 (De-duplication)**、**存储 (Storage)**、**监控报警 (Monitoring & Alerting)**、**代理池管理 (Proxy Pool Management)** 以及 **反爬虫对抗 (Anti-scraping Countermeasures)** 模块，而不仅仅是下载页面的脚本。

## Notes / Constraints（适用条件或限制）
1.  **内存管理 (Memory Management)**：
    Node.js 的 V8 引擎有默认内存限制。在长时间运行的大规模爬虫系统中，需密切监控内存泄漏 (Memory Leak) 问题，必要时需调整 `--max-old-space-size` 参数或采用流式架构。

2.  **反爬虫合规性 (Compliance)**：
    必须严格遵守 `robots.txt` 协议，尊重目标网站的服务条款 (ToS)，并注意数据隐私法规（如 GDPR, CCPA）。避免对目标服务器造成拒绝服务 (DoS) 攻击效果。

3.  **浏览器资源消耗**：
    使用 Puppeteer/Playwright 等无头浏览器非常消耗 CPU 和内存。在设计系统时，应优先尝试 API 逆向或静态解析，仅在必要时降级使用浏览器渲染，并限制并发浏览器实例数量。
