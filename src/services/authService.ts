import { auth } from '../lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { useAuthStore, ExtendedUser } from '../store/useAuthStore';

export const authService = {
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },
  async _mergeGuestData() {
    console.log("Merging guest data with user account...");
  },
  async loginWithEmail(email: string, pass: string) {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  },
  async registerWithEmail(email: string, pass: string, additionalData?: { displayName?: string; phone?: string }) {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (additionalData?.displayName && result.user) {
      await updateProfile(result.user, { displayName: additionalData.displayName });
    }
    return result.user;
  },
  async loginWithPhone(phone: string) {
    // Phone login typically requires recapcha, this is a placeholder
    console.log("loginWithPhone", phone);
    return null;
  },
  async verifyPhoneOtp(phone: string, token: string) {
    console.log("verifyPhoneOtp", phone, token);
    return null;
  },
  async resetPasswordForEmail(email: string) {
    await sendPasswordResetEmail(auth, email);
    return true;
  },
  async updatePassword(password: string) {
    if (auth.currentUser) {
      await firebaseUpdatePassword(auth.currentUser, password);
      return auth.currentUser;
    }
    throw new Error("No current user");
  },
  async logout() {
    await signOut(auth);
  },
  init() {
    const { setUser, setLoading } = useAuthStore.getState();
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        let role = 'customer';
        try {
          const idTokenResult = await user.getIdTokenResult();
          role = idTokenResult.claims.role as string || 'customer';
        } catch (e) {
          console.error(e);
        }
        const extUser: ExtendedUser = Object.assign(user, { role });
        setUser(extUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }
};
