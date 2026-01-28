// 在线状态
export interface PresenceStatus {
  userId: string;
  isOnline: boolean;
  lastOnlineAt?: string;
  onlineDeviceCount?: number;
}
