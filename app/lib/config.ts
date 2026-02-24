/**
 * Centralized configuration module.
 * All environment variables are accessed from here so that
 * changes only need to be made in one place (.env.local).
 *
 * Usage:
 *   import { config } from '@/app/lib/config';
 *   fetch(`${config.backendApiUrl}/auth/login`, { ... });
 */

function getEnvVar(name: string, fallback?: string): string {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(
            `Missing required environment variable: ${name}. ` +
            `Please add it to your .env.local file.`
        );
    }
    return value;
}

export const config = {
    /** Base URL for the Auth / Medical backend API */
    backendApiUrl: getEnvVar('BACKEND_API_URL', 'https://medapi.sunrisesourcings.com'),

    /** Base URL for the Medical AI / Radiology detection API */
    medicalAiApiUrl: getEnvVar('MEDICAL_AI_API_URL', 'https://medicalai.sunrisesourcings.com'),

    /** Current Node environment */
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
} as const;
