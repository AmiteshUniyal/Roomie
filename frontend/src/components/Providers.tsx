'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import AuthProvider from './AuthProvider';

interface ProvidersProps {
    children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <Provider store={store}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </Provider>
    );
} 