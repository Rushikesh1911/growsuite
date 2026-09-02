export declare class GoogleAuthService {
    /**
     * Verifies a Google access_token and returns the user payload.
     * Throws an error if the token is invalid or verification fails.
     */
    static verifyIdToken(accessToken: string): Promise<{
        email: any;
        name: any;
        picture: any;
        googleId: any;
    }>;
}
//# sourceMappingURL=GoogleAuthService.d.ts.map