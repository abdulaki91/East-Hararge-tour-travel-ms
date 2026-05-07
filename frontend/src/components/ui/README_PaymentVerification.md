# Payment Verification Modal

## Overview

The PaymentVerificationModal component allows users to verify pending payments for their bookings. This is useful when payments are processed through external gateways and need manual verification.

## Features

- **Payment Details Display**: Shows booking reference, amount, payment method, and payment ID
- **Real-time Verification**: Calls the backend API to verify payment status
- **Status Feedback**: Provides clear success/failure messages with appropriate icons
- **Auto-refresh**: Automatically refreshes booking data after verification
- **User-friendly Instructions**: Guides users on what to do before verifying

## Usage

The modal is automatically integrated into the BookingCard component and appears when:

- Payment status is "pending"
- Payment ID exists
- Booking is not cancelled

## API Integration

- Uses `paymentService.verifyPayment(paymentId)` to verify payments
- Automatically invalidates React Query cache to refresh data
- Handles errors gracefully with user-friendly messages

## Props

- `isOpen`: Controls modal visibility
- `onClose`: Callback when modal is closed
- `paymentId`: ID of the payment to verify
- `bookingReference`: Booking reference for display
- `amount`: Payment amount
- `paymentMethod`: Payment method used

## States

- **Initial**: Shows payment details and verify button
- **Loading**: Shows spinner while verifying
- **Success**: Shows success icon and confirmation message
- **Error**: Shows error icon and error message
