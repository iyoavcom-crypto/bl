---
trigger: glob
globs: "**/stores/**/*, **/store*, **/*Store*"
description: Zustand 状态管理规范
---

# 状态管理规范

## 技术栈

- **Zustand** - 状态管理
- **Immer** - 不可变更新
- **zustand/middleware/immer** - 集成中间件

## Store 结构

```typescript
// src/stores/exampleStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ExampleState {
  // 状态
  items: Item[];
  loading: boolean;
  error: string | null;
  
  // 操作
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  removeItem: (id: string) => void;
  reset: () => void;
}

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const useExampleStore = create<ExampleState>()(
  immer((set) => ({
    ...initialState,
    
    setItems: (items) => set((state) => {
      state.items = items;
    }),
    
    addItem: (item) => set((state) => {
      state.items.push(item);
    }),
    
    updateItem: (id, updates) => set((state) => {
      const index = state.items.findIndex(i => i.id === id);
      if (index !== -1) {
        Object.assign(state.items[index], updates);
      }
    }),
    
    removeItem: (id) => set((state) => {
      state.items = state.items.filter(i => i.id !== id);
    }),
    
    reset: () => set(initialState),
  }))
);
```

## 核心 Store 清单

| Store | 职责 |
|-------|------|
| `authStore` | 用户认证、Token 管理 |
| `conversationStore` | 会话列表 |
| `messageStore` | 消息 (按会话分组) |
| `contactStore` | 好友列表、申请 |
| `groupStore` | 群组列表、成员 |
| `callStore` | 通话状态 |

## 消息状态流转

```
pending → sent → delivered → read
    ↘
    failed (可重发)
```

状态码:
- `pending` - 发送中 (本地显示)
- `sent` - 已发送
- `delivered` - 已送达
- `read` - 已读
- `failed` - 发送失败

## 乐观更新

```typescript
async function sendMessage(params: SendMessageParams) {
  const localId = nanoid();
  
  // 1. 立即显示 (乐观更新)
  addMessage({
    id: localId,
    localId,
    status: 'pending',
    ...params,
  });
  
  try {
    // 2. 发送到服务器
    const response = await api.post('/messages', params);
    
    // 3. 更新为真实数据
    updateMessage(localId, {
      id: response.data.id,
      status: 'sent',
    });
  } catch {
    // 4. 标记失败
    updateMessage(localId, { status: 'failed' });
  }
}
```

## 选择器

```typescript
// 派生数据使用选择器
export function useMessages(conversationId: string) {
  return useMessageStore(
    state => state.messagesByConversation[conversationId] ?? []
  );
}

// 计算属性
export function useUnreadCount() {
  return useConversationStore(
    state => state.conversations.reduce(
      (sum, c) => sum + c.unreadCount, 0
    )
  );
}
```

## 外部访问

```typescript
// 在非 React 环境中访问
const { user } = useAuthStore.getState();

// 订阅变化
const unsubscribe = useAuthStore.subscribe(
  (state) => state.user,
  (user) => console.log('User changed:', user)
);
```

## 持久化

```typescript
import * as SecureStore from 'expo-secure-store';

// Token 使用 SecureStore (Keychain)
await SecureStore.setItemAsync('access_token', token);

// 非敏感数据使用 AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('@baoliao_theme', 'dark');
```

## 禁止事项

- ❌ 禁止在组件中直接调用 API，必须通过 Store
- ❌ 禁止在 Store 外部直接修改状态
- ❌ 禁止存储派生数据，使用选择器计算
- ❌ 禁止在 Store 中使用 React Hooks

## WebSocket 事件处理

```typescript
// 在 App 根组件监听 WebSocket 事件
useWebSocketEvent<MessagePayload>('message:new', (payload) => {
  const { addMessage } = useMessageStore.getState();
  addMessage(payload.message);
});

useWebSocketEvent<ReadReceipt>('message:read', (payload) => {
  const { updateMessagesReadStatus } = useMessageStore.getState();
  updateMessagesReadStatus(
    payload.conversationId,
    payload.lastReadMessageId
  );
});
```
