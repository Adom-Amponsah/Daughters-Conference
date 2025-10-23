export interface ColorScheme {
  primary: string;
  secondary: string;
}

export interface RegistrationCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: ColorScheme;
  onClick: () => void;
}