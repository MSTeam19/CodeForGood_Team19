"use client";

import { useAuth } from "@/contexts/authContext";
import {
    Add,
    AutoStories,
    Home,
    Leaderboard,
    Map,
    Person,
} from "@mui/icons-material";
import {
    Badge,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Fab,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface MobileBottomNavProps {
  onCreatePost?: () => void;
}

export function MobileBottomNav({ onCreatePost }: MobileBottomNavProps) {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Map paths to navigation values
  const pathToValue = {
    "/": 0,
    "/home": 0,
    "/stories": 1,
    "/leaderboard": 2,
    "/needs-map": 3,
    "/dashboard": 4,
  };

  // Update navigation value based on current path
  useEffect(() => {
    const currentValue = pathToValue[location.pathname as keyof typeof pathToValue];
    if (currentValue !== undefined) {
      setValue(currentValue);
    }
  }, [location.pathname]);

  const handleNavigationChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    switch (newValue) {
      case 0:
        navigate("/");
        break;
      case 1:
        navigate("/stories");
        break;
      case 2:
        navigate("/leaderboard");
        break;
      case 3:
        navigate("/needs-map");
        break;
      case 4:
        if (isAuthenticated) {
          navigate("/dashboard");
        } else {
          // Could trigger login modal here
          navigate("/");
        }
        break;
    }
  };

  return (
    <>
      {/* Floating Action Button for Create Post */}
      {isAuthenticated && onCreatePost && (
        <Fab
          color="primary"
          aria-label="create post"
          onClick={onCreatePost}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            zIndex: 1000,
            display: { xs: "flex", md: "none" },
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Bottom Navigation */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          display: { xs: "block", md: "none" },
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <BottomNavigation
          value={value}
          onChange={handleNavigationChange}
          showLabels
          sx={{
            height: 70,
            "& .MuiBottomNavigationAction-root": {
              minWidth: "auto",
              paddingTop: 1,
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.7rem",
              marginTop: 0.5,
            },
          }}
        >
          <BottomNavigationAction
            label="Home"
            icon={<Home />}
            sx={{
              color: value === 0 ? "primary.main" : "text.secondary",
            }}
          />
          <BottomNavigationAction
            label="Stories"
            icon={<AutoStories />}
            sx={{
              color: value === 1 ? "primary.main" : "text.secondary",
            }}
          />
          <BottomNavigationAction
            label="Leaderboard"
            icon={
              <Badge badgeContent={""} color="error" variant="dot">
                <Leaderboard />
              </Badge>
            }
            sx={{
              color: value === 2 ? "primary.main" : "text.secondary",
            }}
          />
          <BottomNavigationAction
            label="Map"
            icon={<Map />}
            sx={{
              color: value === 3 ? "primary.main" : "text.secondary",
            }}
          />
          {isAuthenticated && (
            <BottomNavigationAction
              label="Profile"
              icon={<Person />}
              sx={{
                color: value === 4 ? "primary.main" : "text.secondary",
              }}
            />
          )}
        </BottomNavigation>
      </Box>

      {/* Bottom padding to prevent content from being hidden behind navigation */}
      <Box
        sx={{
          height: 70,
          display: { xs: "block", md: "none" },
        }}
      />
    </>
  );
}
