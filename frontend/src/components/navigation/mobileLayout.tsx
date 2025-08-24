"use client";

import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { MobileBottomNav } from "./mobileBottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  onCreatePost?: () => void;
  showBottomNav?: boolean;
}

export function MobileLayout({ 
  children, 
  onCreatePost, 
  showBottomNav = true 
}: MobileLayoutProps) {
  return (
    <Box sx={{ pb: { xs: showBottomNav ? 9 : 0, md: 0 } }}>
      {children}
      {showBottomNav && <MobileBottomNav onCreatePost={onCreatePost} />}
    </Box>
  );
}
