请帮我实现语音通话功能。

需要的 API:
- POST /api/im/calls/initiate (发起通话)
- POST /api/im/calls/:callId/ring (响铃)
- POST /api/im/calls/:callId/accept (接听)
- POST /api/im/calls/:callId/reject (拒绝)
- POST /api/im/calls/:callId/hangup (挂断)
- POST /api/im/calls/:callId/signal (WebRTC 信令)

WebSocket 事件:
- call:invite (来电)
- call:ring (响铃)
- call:answer (接听)
- call:end (结束)
- call:signal (信令)

实现步骤:
1. 发起通话界面
2. 来电接听界面
3. WebRTC 连接建立
4. 通话中界面

请使用 TypeScript、React Native/Expo 和 WebRTC。
