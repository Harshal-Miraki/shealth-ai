

export interface User {
    id: string;
    email: string;
    name: string;
    licenseId?: string;
    role: "admin" | "doctor" | "radiologist";
    phone?: string;
    department?: string;
    preferences?: {
        theme?: 'light' | 'dark' | 'system';
        language?: string;
        timezone?: string;
    };
}

const USERS_STORAGE_KEY = 'shealth_users';
const CURRENT_USER_KEY = 'shealth_current_user';

export interface AuthResponse {
    user: User;
    token: string;
}

export const authService = {
    async login(email: string, password?: string): Promise<AuthResponse> {
        // Call our internal proxy which forwards to the external API
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Auth Service: Login Error", errorData);

            // Handle various error formats
            let errorMessage = errorData.error || errorData.message || "Login failed";
            if (errorData.detail) {
                errorMessage = typeof errorData.detail === 'string'
                    ? errorData.detail
                    : JSON.stringify(errorData.detail);
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();

        // Map API user to App user
        // Adjust these fields based on actual API response structure if needed
        const sessionUser: User = {
            id: result.user_id || result.user?.id || "u_" + Date.now(),
            email: result.email || result.user?.email || email,
            name: result.full_name || result.user?.full_name || result.user?.name || "Doctor",
            role: "doctor", // Defaulting to doctor as API might not return role
            licenseId: result.license_id || undefined
        };

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));

        return {
            user: sessionUser,
            token: result.access_token || result.token || "mock_jwt_token_" + Date.now()
        };
    },

    async register(data: any): Promise<AuthResponse> {
        // Call our internal proxy which forwards to the external API
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                full_name: data.fullName, // Mapped from form data
                email: data.email,
                password: data.password,
                confirm_password: data.confirmPassword,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Auth Service: Registration Error", errorData);

            // Handle various error formats (Laravel, FastAPI, etc.)
            let errorMessage = errorData.error || errorData.message || "Registration failed";

            if (errorData.detail) {
                // FastAPI style
                errorMessage = typeof errorData.detail === 'string'
                    ? errorData.detail
                    : JSON.stringify(errorData.detail);
            } else if (errorData.errors) {
                // Laravel style valiation errors
                errorMessage = Object.values(errorData.errors).flat().join(', ');
            }

            throw new Error(errorMessage);
        }

        const result = await response.json();

        // No auto-login after register, require manual login
        // But we return user info for UI feedback
        return {
            user: {
                id: result.user_id || "u_" + Date.now(),
                email: data.email,
                name: data.fullName,
                role: "doctor"
            },
            token: ""
        };
    },

    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(CURRENT_USER_KEY);
            // We don't remove USERS_STORAGE_KEY so they can log back in
        }
    },

    getCurrentUser(): User | null {
        if (typeof window !== 'undefined') {
            const userJson = localStorage.getItem(CURRENT_USER_KEY);
            return userJson ? JSON.parse(userJson) : null;
        }
        return null;
    },

    async updateUser(userData: Partial<User>): Promise<User> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (typeof window === 'undefined') {
            throw new Error("Cannot update user on server side");
        }

        const currentUserJson = localStorage.getItem(CURRENT_USER_KEY);
        if (!currentUserJson) {
            throw new Error("No authenticated user found");
        }

        const currentUser = JSON.parse(currentUserJson);
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        const users = usersJson ? JSON.parse(usersJson) : [];

        // Update in users list
        const updatedUsers = users.map((u: any) => {
            if (u.id === currentUser.id) {
                return { ...u, ...userData };
            }
            return u;
        });

        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

        // Update current session
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

        return updatedUser;
    }
};
