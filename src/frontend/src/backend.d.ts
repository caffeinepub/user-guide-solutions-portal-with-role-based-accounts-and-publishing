import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Post {
    title: string;
    created: bigint;
    content: string;
    isPublished: boolean;
    tags: Array<string>;
    lastUpdated: bigint;
    author: Principal;
}
export interface Draft {
    title: string;
    content: string;
    tags: Array<string>;
}
export interface UserProfile {
    name: string;
}
export type PostId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deletePost(postId: PostId): Promise<void>;
    getAllPosts(): Promise<Array<Post> | null>;
    getBlogs(): Promise<Array<Post>>;
    getBlogsByMe(): Promise<Array<Post>>;
    getCallerDrafts(): Promise<Array<Draft>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPosts(): Promise<Array<Post>>;
    getPostsByMe(): Promise<Array<Post>>;
    getTaggedPostIds(tag: string): Promise<Array<PostId> | null>;
    getUntaggedPosts(): Promise<Array<PostId>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    publish(postId: PostId): Promise<void>;
    removeDraft(draftIndex: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDraft(title: string, content: string, tags: Array<string>): Promise<void>;
    submitBlog(title: string, content: string, tags: Array<string>): Promise<void>;
    submitPost(title: string, content: string, tags: Array<string>): Promise<void>;
    unpublish(postId: PostId): Promise<void>;
    updatePost(postId: PostId, title: string, content: string, tags: Array<string>): Promise<void>;
}
