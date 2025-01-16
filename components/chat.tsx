'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';

import { Block } from './block';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useBlockSelector } from '@/hooks/use-block';

// 채팅 컴포넌트 - 채팅 UI와 기능을 담당
export function Chat({
  id, // 채팅방 ID
  initialMessages, // 초기 메시지 목록
  selectedModelId, // 선택된 AI 모델 ID
  selectedVisibilityType, // 채팅방 공개 설정
  isReadonly, // 읽기 전용 모드 여부
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig(); // SWR 캐시 업데이트를 위한 mutate 함수

  // useChat 훅을 통한 채팅 기능 관리
  const {
    messages, // 채팅 메시지 목록
    setMessages, // 메시지 목록 업데이트 함수
    handleSubmit, // 메시지 전송 핸들러
    input, // 입력창 텍스트
    setInput, // 입력창 텍스트 업데이트 함수
    append, // 새 메시지 추가 함수
    isLoading, // 로딩 상태
    stop, // 메시지 생성 중단 함수
    reload, // 메시지 재생성 함수
  } = useChat({
    id,
    body: { id, modelId: selectedModelId },
    initialMessages,
    experimental_throttle: 100, // 메시지 스트리밍 제한 (100ms)
    onFinish: () => {
      mutate('/api/history'); // 채팅 완료 시 히스토리 업데이트
    },
  });

  // 투표 데이터 가져오기
  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  // 첨부파일 상태 관리
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  // 블록 표시 여부 상태
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  return (
    <>
      {/* 채팅 인터페이스 컨테이너 */}
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        {/* 채팅방 헤더 */}
        <ChatHeader
          chatId={id}
          selectedModelId={selectedModelId}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        {/* 메시지 목록 */}
        <Messages
          chatId={id}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isBlockVisible={isBlockVisible}
        />

        {/* 메시지 입력 폼 */}
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      {/* 사이드 블록 컴포넌트 */}
      <Block
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
