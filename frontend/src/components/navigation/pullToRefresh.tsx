"use client";

import { Refresh } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useRef, useState, type ReactNode } from "react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  disabled = false 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || window.scrollY > 0) return;
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled) return;
    
    currentY.current = e.touches[0].clientY;
    const diffY = Math.max(0, currentY.current - startY.current);
    
    if (diffY > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(diffY * 0.5, MAX_PULL));
    }
  }, [isPulling, disabled]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [isPulling, pullDistance, onRefresh, disabled]);

  const refreshProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldShowRefresh = pullDistance >= PULL_THRESHOLD;

  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        touchAction: isPulling ? 'none' : 'auto',
      }}
    >
      {/* Pull to Refresh Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          left: 0,
          right: 0,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          transform: `translateY(${Math.min(pullDistance, 60)}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease',
          zIndex: 10,
        }}
      >
        {isRefreshing ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Refreshing...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Refresh 
              sx={{ 
                transform: `rotate(${refreshProgress * 180}deg)`,
                color: shouldShowRefresh ? 'primary.main' : 'text.secondary',
                transition: 'color 0.2s ease',
              }} 
            />
            <Typography 
              variant="body2" 
              color={shouldShowRefresh ? 'primary.main' : 'text.secondary'}
              sx={{ transition: 'color 0.2s ease' }}
            >
              {shouldShowRefresh ? 'Release to refresh' : 'Pull to refresh'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
