import { ScheduledBannerManager } from "@/components/admin/scheduled-banner-manager";

export function HomeBannerManager() {
  return (
    <ScheduledBannerManager
      tableName="home_banners"
      storagePathPrefix="home-banner"
      defaultHref="/market"
      defaultAlt="딜렉스타 배너"
      helperText="현재 시각이 시작·종료 구간 안에 있는 활성 배너 중 가장 최근 등록된 1개가 홈 상단(마켓·커뮤니티 위)에 노출됩니다. 조건에 맞는 배너가 없으면 기본 배너가 표시됩니다."
      aspectLabel="600×150"
      aspectRatio="600 / 150"
    />
  );
}