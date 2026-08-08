# 1. EmailVerificationBanner.tsx
sed -i 's/user.email_confirmed_at/user.emailVerified/g' src/components/account/EmailVerificationBanner.tsx

# 2. Navbar.tsx
sed -i 's/user.phone/user.phoneNumber/g' src/components/layout/Navbar.tsx
# add authService import if missing in Navbar
if ! grep -q "authService" src/components/layout/Navbar.tsx; then
  # Wait, Navbar already has authService usage, but might be missing import. Let's sed it.
  sed -i '/import { useAuthStore }/a import { authService } from "../../services/authService";' src/components/layout/Navbar.tsx
fi

# 3. Dashboard.tsx
sed -i 's/user.phone/user.phoneNumber/g' src/pages/account/Dashboard.tsx

# 4. OrderDetails.tsx
sed -i '/updatedAt:/d' src/pages/account/OrderDetails.tsx

# 5. Orders.tsx
sed -i 's/user.id/user.uid/g' src/pages/account/Orders.tsx

# 6. Profile.tsx
sed -i 's/user.phone/user.phoneNumber/g' src/pages/account/Profile.tsx

