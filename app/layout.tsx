import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';

// 메타데이터 설정 - SEO 및 웹사이트 기본 정보 정의
export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'Next.js Chatbot Template',
  description: 'Next.js chatbot template using the AI SDK.',
};

// 뷰포트 설정 - 모바일 Safari에서 자동 확대 비활성화
export const viewport = {
  maximumScale: 1,
};

// 테마 색상 정의
const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)'; // 라이트 테마 색상 (흰색)
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)'; // 다크 테마 색상 (어두운 회색)

// 테마 색상을 동적으로 업데이트하는 스크립트
// HTML의 class 변경을 감지하여 theme-color 메타 태그를 업데이트
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

// 루트 레이아웃 컴포넌트 - 모든 페이지의 기본 레이아웃 구조 정의
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // next-themes가 body에 추가 클래스를 주입하여 hydration 전 깜빡임을 방지
      // suppressHydrationWarning prop으로 React hydration 불일치 경고 방지
      suppressHydrationWarning
    >
      <head>
        {/* 테마 색상 동적 업데이트를 위한 인라인 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        {/* ThemeProvider로 다크모드 지원 설정 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system" // 기본 테마는 시스템 설정 따름
          enableSystem // 시스템 테마 사용 활성화
          disableTransitionOnChange // 테마 전환시 트랜지션 효과 비활성화
        >
          {/* 토스트 알림 컴포넌트 */}
          <Toaster position="top-center" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
