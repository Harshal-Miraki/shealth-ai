export interface User {
    id: string;
    email: string;
    name: string;
    licenseId?: string;
    role: "admin" | "doctor" | "radiologist";
}

interface AuthResponse {
    user: User;
    token: string;
}

export const authService = {
    async login(email: string): Promise<AuthResponse> {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
            user: {
                id: "u_123",
                email,
                name: "Dr. Sarah Smith",
                role: "doctor"
            },
            token: "mock_jwt_token_12345"
        };
    },

    async register(data: any): Promise<AuthResponse> {
         // Simulate API call
         await new Promise(resolve => setTimeout(resolve, 2000));

         return {
            user: {
                id: "u_new_456",
                email: data.email,
                name: data.fullName,
                licenseId: data.licenseId,
                role: "doctor"
            },
            token: "mock_jwt_token_new_user"
         };
    },

    logout(): void {
        // Clear stored auth data
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    }
};
