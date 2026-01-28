import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export function AboutScreen({ route }: Props) {
  const { type = 'about' } = route.params || {};

  const getContent = () => {
    switch (type) {
      case 'terms':
        return {
          title: '服务协议',
          content: `欢迎使用包聊！

在使用我们的服务之前，请仔细阅读本服务协议。

一、服务说明
包聊是一款即时通讯应用，为用户提供文字、语音、视频等多种形式的实时通信服务。

二、用户责任
1. 用户应对其账号信息和密码保密
2. 用户不得利用本服务从事违法违规活动
3. 用户发布的内容应遵守法律法规和社会公德
4. 用户不得传播垃圾信息或骚扰他人

三、隐私保护
我们重视用户隐私，承诺保护用户的个人信息安全。具体请参见《隐私政策》。

四、知识产权
本服务的所有内容，包括但不限于软件、文字、图片等，均受知识产权法律保护。

五、免责声明
1. 因不可抗力导致的服务中断，我们不承担责任
2. 用户之间的纠纷应自行解决
3. 用户违规使用服务造成的损失由用户自行承担

六、协议变更
我们保留随时修改本协议的权利，修改后的协议将在应用内公布。

七、法律适用
本协议适用中华人民共和国法律。

最后更新：2026年1月

如有疑问，请联系我们：support@baoliao.im`,
        };

      case 'privacy':
        return {
          title: '隐私政策',
          content: `包聊隐私政策

生效日期：2026年1月

我们重视您的隐私。本隐私政策说明了包聊如何收集、使用和保护您的个人信息。

一、信息收集
我们收集以下信息：
• 账号信息：手机号、昵称
• 使用信息：聊天记录、好友关系
• 设备信息：设备型号、操作系统版本
• 位置信息：仅在您授权时收集

二、信息使用
我们使用收集的信息用于：
• 提供即时通讯服务
• 改善用户体验
• 保障账号安全
• 遵守法律要求

三、信息共享
我们承诺：
• 不会出售您的个人信息
• 不会与第三方共享您的隐私数据
• 仅在法律要求或您授权时共享必要信息

四、信息安全
我们采取的安全措施：
• 数据传输加密
• 服务器安全防护
• 严格的访问控制
• 定期安全审计

五、您的权利
您有权：
• 查看和修改个人信息
• 删除账号和数据
• 撤回隐私授权
• 投诉和举报

六、未成年人保护
我们不会有意收集未满18岁未成年人的个人信息。

七、Cookie使用
我们使用Cookie改善用户体验，您可以在设置中管理Cookie。

八、政策更新
我们可能不时更新本隐私政策，重大变更会提前通知您。

九、联系我们
如对本政策有任何疑问，请联系：
邮箱：privacy@baoliao.im
地址：中国

本政策最后更新于2026年1月`,
        };

      default:
        return {
          title: '关于包聊',
          content: `包聊 v1.0.0

包聊是一款简洁、安全、高效的即时通讯应用。

核心功能：
• 即时通讯：支持文字、语音、视频聊天
• 好友管理：轻松添加和管理好友
• 群组聊天：创建和加入群组
• 隐私保护：端到端加密保障通信安全

设计理念：
简洁而不简单，我们致力于打造一款纯粹的通讯工具，让沟通更高效。

安全承诺：
• 您的聊天记录经过加密保护
• 我们不会读取或分享您的私人信息
• 您可以随时删除您的数据

开发团队：
包聊团队致力于为用户提供优质的通讯体验。

联系我们：
• 客服邮箱：support@baoliao.im
• 官方网站：https://baoliao.im
• 意见反馈：feedback@baoliao.im

感谢您选择包聊！

版权所有 © 2026 包聊团队`,
        };
    }
  };

  const { title, content } = getContent();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.contentText}>{content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#000000',
  },
});
