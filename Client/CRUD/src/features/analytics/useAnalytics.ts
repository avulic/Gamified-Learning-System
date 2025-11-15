import { ref, onMounted } from 'vue';
import { AnalyticsService, type AnalyticsData } from '@/services/AnalyticsService';

export function useAnalytics(userId: string) {
  const analyticsData = ref<AnalyticsData | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  const analyticsService = new AnalyticsService(
    /* inject services */
  );

  const fetchAnalytics = async () => {
    try {
      isLoading.value = true;
      analyticsData.value = await analyticsService.getUserAnalytics(userId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch analytics';
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(fetchAnalytics);

  return {
    analyticsData,
    isLoading,
    error,
    refreshAnalytics: fetchAnalytics
  };
}