# Component Structure

This document outlines the modular component structure for the East Hararghe Tour & Travel Management System.

## Company Components (`/company`)

### PackageStatsGrid.tsx

- **Purpose**: Displays statistics grid for company packages
- **Props**: `packages` array
- **Features**: Shows total, active, inactive packages and total reviews
- **Styling**: Modern cards with hover effects and gradients

### PackageTable.tsx

- **Purpose**: Main table component for displaying packages
- **Props**: `packages`, `onToggleStatus`, `onDelete`, `isToggling`
- **Features**: Responsive table with actions for each package
- **Components Used**: PackageTableRow

### PackageTableRow.tsx

- **Purpose**: Individual row component for package table
- **Props**: `pkg`, `onToggleStatus`, `onDelete`, `isToggling`
- **Features**: Package details, status badges, action buttons
- **Actions**: View, Edit, Toggle Status, Delete

### DeletePackageModal.tsx

- **Purpose**: Confirmation modal for package deletion
- **Props**: `isOpen`, `packageTitle`, `onClose`, `onConfirm`, `isDeleting`
- **Features**: Confirmation dialog with loading state

## User Components (`/user`)

### BookingFilters.tsx

- **Purpose**: Filter component for user bookings
- **Props**: `filters`, `onFilterChange`, `onClearFilters`
- **Features**: Status and payment status filters with clear option
- **Styling**: Modern form inputs with glassmorphism effects

### BookingCard.tsx

- **Purpose**: Individual booking card component
- **Props**: `booking`, `getStatusVariant`
- **Features**: Booking details, status badges, action buttons
- **Layout**: Responsive card with booking information and actions

## Common Components (`/common`)

### Pagination.tsx

- **Purpose**: Reusable pagination component
- **Props**: `pagination`, `onPageChange`
- **Features**: Previous/Next navigation with page info
- **Styling**: Modern buttons with shadow effects

## Benefits of Modularization

1. **Reusability**: Components can be reused across different pages
2. **Maintainability**: Easier to update and fix individual components
3. **Testing**: Each component can be tested independently
4. **Performance**: Better code splitting and lazy loading potential
5. **Readability**: Cleaner, more focused component files
6. **Separation of Concerns**: Each component has a single responsibility

## Usage Examples

### CompanyPackages Page

```tsx
import PackageStatsGrid from "../../components/company/PackageStatsGrid";
import PackageTable from "../../components/company/PackageTable";
import DeletePackageModal from "../../components/company/DeletePackageModal";
import Pagination from "../../components/common/Pagination";

// Usage in component
<PackageStatsGrid packages={packages} />
<PackageTable
  packages={packages}
  onToggleStatus={handleToggleStatus}
  onDelete={handleDelete}
  isToggling={toggleStatusMutation.isPending}
/>
<Pagination pagination={pagination} onPageChange={handlePageChange} />
```

### UserBookings Page

```tsx
import BookingFiltersComponent from "../../components/user/BookingFilters";
import BookingCard from "../../components/user/BookingCard";
import Pagination from "../../components/common/Pagination";

// Usage in component
<BookingFiltersComponent
  filters={filters}
  onFilterChange={handleFilterChange}
  onClearFilters={handleClearFilters}
/>;
{
  bookings.map((booking) => (
    <BookingCard
      key={booking.id}
      booking={booking}
      getStatusVariant={getStatusVariant}
    />
  ));
}
<Pagination pagination={pagination} onPageChange={handlePageChange} />;
```

## Type Safety

All components are fully typed with TypeScript interfaces, ensuring:

- Compile-time error checking
- Better IDE support and autocomplete
- Clear component contracts
- Reduced runtime errors

## Styling Consistency

All components follow the established design system:

- Consistent color palette (primary, secondary, success, warning, error)
- Modern glassmorphism effects
- Smooth animations and transitions
- Responsive design patterns
- Accessibility considerations
