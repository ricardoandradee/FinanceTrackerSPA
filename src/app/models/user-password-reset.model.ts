export interface UserPasswordReset {
    userId: number;
    confirmationCode: string;
    password: string;
}