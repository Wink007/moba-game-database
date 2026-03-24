import type { ComponentType } from 'react';

export interface NavItem {
  key: string;
  path: string;
  Icon: ComponentType;
  mobileOnly?: boolean;
  absolute?: boolean;
  socialOnly?: boolean;
  playersOnly?: boolean;
}

export interface MobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SettingsPanelProps {
  onBack: () => void;
  onClose: () => void;
}

export interface BottomNavProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}
