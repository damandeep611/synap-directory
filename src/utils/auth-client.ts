import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL:
        typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000",
    plugins: [adminClient()],
    fetchOptions: {
        credentials: "include", // Ensures cookies are sent with requests
    },
});

export const { signIn, signOut, useSession } = authClient;
