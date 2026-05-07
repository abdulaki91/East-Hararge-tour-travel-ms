# User Dashboard Components

This directory contains modular components for the user dashboard, promoting reusability and maintainability.

## Components

### WelcomeHeader

- **Purpose**: Displays personalized welcome message and user avatar
- **Props**: `userName?: string`
- **Usage**: Header section of the dashboard

### DashboardStats

- **Purpose**: Shows user statistics in a grid layout
- **Props**:
  - `stats: StatsData` - User statistics data
  - `isLoading?: boolean` - Loading state
- **Features**:
  - Responsive grid layout
  - Loading skeleton
  - Animated hover effects

### RecentBookings

- **Purpose**: Displays user's recent bookings
- **Props**:
  - `bookings: Booking[]` - Array of booking data
  - `isLoading?: boolean` - Loading state
- **Features**:
  - Empty state handling
  - Status badges
  - Loading skeleton
  - Link to full bookings page

### TravelTips

- **Purpose**: Shows helpful travel tips and advice
- **Props**: None (static content)
- **Features**:
  - Responsive grid layout
  - Gradient background
  - Icon integration

## Usage Example

```tsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useUserDashboard } from "../../hooks/useUserDashboard";

import {
  WelcomeHeader,
  DashboardStats,
  RecentBookings,
  TravelTips,
} from "../../components/user";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount } = useSocket();
  const { recentBookings, stats, isLoading } = useUserDashboard();

  return (
    <div className="space-y-8">
      <WelcomeHeader userName={user?.name} />
      <DashboardStats stats={stats} isLoading={isLoading} />
      <RecentBookings bookings={recentBookings} isLoading={isLoading} />
      <TravelTips />
    </div>
  );
};
```

## Benefits of Modular Structure

1. **Reusability**: Components can be used in other parts of the application
2. **Maintainability**: Easier to update and debug individual components
3. **Testing**: Each component can be tested in isolation
4. **Performance**: Components can be lazy-loaded if needed
5. **Collaboration**: Multiple developers can work on different components simultaneously

## Custom Hook Integration

The dashboard uses the `useUserDashboard` hook to manage data fetching and state:

```tsx
const {
  recentBookings,
  stats,
  isBookingsLoading,
  isStatsLoading,
  isLoading,
  hasError,
  refetchAll,
} = useUserDashboard();
```

This hook encapsulates all the data fetching logic and provides a clean interface for the components.

## Styling

All components use Tailwind CSS with:

- Consistent spacing and typography
- Responsive design patterns
- Hover and transition effects
- Loading states and skeletons
- Gradient backgrounds and shadows

## Future Enhancements

- Add more interactive features
- Implement component-level error boundaries
- Add animation libraries for enhanced UX
- Create storybook documentation
- Add accessibility improvements
