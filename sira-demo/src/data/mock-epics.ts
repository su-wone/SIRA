import { Epic } from './types';

export const mockEpics: Epic[] = [
  {
    id: 'epic-1',
    title: '소셜 로그인 통합',
    color: '#3B82F6',
    description: 'Google, GitHub OAuth 소셜 로그인 구현',
  },
  {
    id: 'epic-2',
    title: '결제 시스템',
    color: '#10B981',
    description: 'Stripe 기반 구독 결제 및 빌링 시스템',
  },
  {
    id: 'epic-3',
    title: '대시보드 애널리틱스',
    color: '#F59E0B',
    description: '팀 생산성 및 프로젝트 진행 현황 분석 대시보드',
  },
];
