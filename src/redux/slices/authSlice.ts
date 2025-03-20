import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userId: string | null;
  name: string | null;
  email: string | null;
  role: 'customer' | 'pharmacy' | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  userId: null,
  name: null,
  email: null,
  role: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload, isAuthenticated: true };
    },
    logout: (state) => {
      return initialState;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
