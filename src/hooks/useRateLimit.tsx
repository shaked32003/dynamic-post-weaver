
import { useQuery } from "@tanstack/react-query";
import { contentAPI } from "@/services/api";
import { RateLimitInfo } from "@/types";

export function useRateLimit() {
  const {
    data: rateLimit,
    isLoading,
    error,
    refetch
  } = useQuery<RateLimitInfo>({
    queryKey: ["rateLimit"],
    queryFn: () => contentAPI.getUserRateLimit(),
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  });

  const isRateLimited = rateLimit ? rateLimit.remaining <= 0 : false;
  
  const formatResetTime = () => {
    if (!rateLimit) return "";
    const resetTime = new Date(rateLimit.resetTime);
    return resetTime.toLocaleTimeString();
  };
  
  return {
    rateLimit,
    isLoading,
    error,
    isRateLimited,
    formatResetTime,
    refetch
  };
}
