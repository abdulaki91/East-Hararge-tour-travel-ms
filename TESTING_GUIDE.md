# 🧪 System Testing Guide

## Prerequisites

- Backend running on http://localhost:5000
- Frontend running on http://localhost:5173
- Database seeded with test data (`npm run seed`)

---

## Test Accounts

### Admin Account

- **Email**: `admin@easthararghetours.com`
- **Password**: `password123`

### Company Accounts

- **Email**: `harar@culturaltours.com` | **Password**: `password123`
- **Email**: `dire@adventuretours.com` | **Password**: `password123`

### User Accounts

- **Email**: `mohammed.ali@email.com` | **Password**: `password123`
- **Email**: `hanan.ahmed@email.com` | **Password**: `password123`

---

## Test Scenarios

### 1. User Registration & Login

**Test New Registration:**

1. Go to http://localhost:5173
2. Click "Sign Up" or "Register"
3. Fill form:
   - Name: `Test User`
   - Email: `testuser@email.com`
   - Password: `password123`
   - Phone: `+251911111111`
   - Role: `USER`
4. Click "Register"
5. ✅ Should redirect to dashboard/home

**Test Login:**

1. Click "Login"
2. Enter: `mohammed.ali@email.com` / `password123`
3. Click "Login"
4. ✅ Should see user dashboard

**Test Wrong Password:**

1. Try login with wrong password
2. ✅ Should show error message

---

### 2. Browse & Search Packages

**View All Packages:**

1. Login as user
2. Go to "Packages" page
3. ✅ Should see list of tour packages

**Search Packages:**

1. Use search bar: type "Harar"
2. ✅ Should filter packages with "Harar"

**Filter by Price:**

1. Set price range: Min 500, Max 1000
2. ✅ Should show packages in that range

**View Package Details:**

1. Click on any package card
2. ✅ Should see full details, images, itinerary, reviews

---

### 3. Create Booking

**Make a Booking:**

1. Login as: `mohammed.ali@email.com`
2. Select any package
3. Click "Book Now"
4. Fill form:
   - Number of people: `2`
   - Booking date: Select future date
   - Special requests: `Vegetarian meals`
5. Click "Confirm Booking"
6. ✅ Should create booking with "Pending" status

**View My Bookings:**

1. Go to "My Bookings"
2. ✅ Should see the new booking listed

---

### 4. Payment Process

**Make Payment:**

1. Go to "My Bookings"
2. Find pending booking
3. Click "Pay Now"
4. Select payment method: `Chapa` or `Telebirr`
5. Complete payment (test mode)
6. ✅ Booking status should change to "Confirmed"

**View Payment History:**

1. Go to "My Payments"
2. ✅ Should see payment record

---

### 5. Write Review

**Submit Review:**

1. Login as user with completed booking
2. Go to "My Bookings"
3. Find completed booking
4. Click "Write Review"
5. Rate: `5 stars`
6. Comment: `Amazing experience!`
7. Click "Submit"
8. ✅ Review should appear on package page

**Edit Review:**

1. Go to "My Reviews"
2. Click "Edit" on any review
3. Change rating/comment
4. ✅ Should update successfully

---

### 6. Company Features

**Login as Company:**

1. Login: `harar@culturaltours.com` / `password123`
2. ✅ Should see company dashboard

**View Company Packages:**

1. Go to "My Packages"
2. ✅ Should see packages created by this company

**Create New Package:**

1. Click "Create Package"
2. Fill form:
   - Title: `Test Package`
   - Description: `Test description`
   - Location: `Harar`
   - Duration: `3 days`
   - Price: `500`
   - Max people: `10`
   - Start/End dates
3. Upload images (optional)
4. Add itinerary
5. Click "Create"
6. ✅ Package should appear in listings

**View Company Bookings:**

1. Go to "Company Bookings"
2. ✅ Should see bookings for company packages

**Update Booking Status:**

1. Select a pending booking
2. Change status to "Confirmed"
3. ✅ Status should update

---

### 7. Admin Features

**Login as Admin:**

1. Login: `admin@easthararghetours.com` / `password123`
2. ✅ Should see admin dashboard

**View Dashboard Stats:**

1. Check dashboard
2. ✅ Should see: total users, companies, packages, bookings, revenue

**Manage Users:**

1. Go to "Users Management"
2. ✅ Should see all users
3. Try deactivating a user
4. ✅ User should be deactivated

**Manage Companies:**

1. Go to "Companies Management"
2. ✅ Should see all companies
3. Try verifying/unverifying a company
4. ✅ Status should change

---

### 8. Notifications

**Check Notifications:**

1. Login as any user
2. Click notification bell icon
3. ✅ Should see notifications list

**Mark as Read:**

1. Click on a notification
2. ✅ Should mark as read

**Real-time Notifications:**

1. Open two browser windows
2. Login as user in one, company in other
3. Create booking as user
4. ✅ Company should receive notification instantly

---

### 9. Profile Management

**Update Profile:**

1. Login as any user
2. Go to "Profile" or "Settings"
3. Update name/phone
4. Click "Save"
5. ✅ Should update successfully

---

## Quick Test Checklist

### User Flow

- [ ] Register new user
- [ ] Login successfully
- [ ] Browse packages
- [ ] Search/filter packages
- [ ] View package details
- [ ] Create booking
- [ ] Make payment
- [ ] View booking history
- [ ] Write review
- [ ] Receive notifications

### Company Flow

- [ ] Login as company
- [ ] View dashboard stats
- [ ] Create new package
- [ ] Edit package
- [ ] View company bookings
- [ ] Update booking status
- [ ] Verify payments

### Admin Flow

- [ ] Login as admin
- [ ] View dashboard analytics
- [ ] Manage users
- [ ] Manage companies
- [ ] Verify companies
- [ ] View all bookings

---

## Common Issues to Check

### ❌ If Login Fails

- Check if backend is running
- Verify email/password
- Check browser console for errors

### ❌ If Packages Don't Load

- Check if database is seeded
- Verify API connection
- Check network tab in browser

### ❌ If Images Don't Show

- Check if uploads folder exists
- Verify file permissions
- Check image paths in database

### ❌ If Notifications Don't Work

- Check Socket.IO connection
- Verify CORS settings
- Check browser console

---

## Testing Tips

1. **Use Browser DevTools** (F12) to check:
   - Console for errors
   - Network tab for API calls
   - Application tab for tokens

2. **Test Different Roles** - Login as user, company, and admin to test all features

3. **Test Edge Cases**:
   - Empty forms
   - Invalid data
   - Expired tokens
   - Duplicate bookings

4. **Test Responsiveness** - Resize browser to test mobile view

5. **Clear Cache** if you see old data

---

## Expected Results Summary

✅ All pages load without errors  
✅ Authentication works for all roles  
✅ CRUD operations work (Create, Read, Update, Delete)  
✅ Payments process successfully  
✅ Notifications appear in real-time  
✅ Images upload and display correctly  
✅ Search and filters work properly  
✅ Role-based access control works

---

## Report Issues

If you find bugs, note:

- What you were doing
- Expected vs actual result
- Error messages
- Browser console errors
- Screenshots (if applicable)

---

**Happy Testing! 🚀**
