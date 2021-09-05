export interface Category {
    id: number;
    userId: string;
    name: string;
    createdDate?: Date;
    canBeDeleted: Boolean;
}