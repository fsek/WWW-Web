// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options, urlSearchParamsBodySerializer, formDataBodySerializer } from '@hey-api/client-fetch';
import { type UsersGetAllUsersError, type UsersGetAllUsersResponse, type UsersGetMeError, type UsersGetMeResponse, type UsersUpdateMeData, type UsersUpdateMeError, type UsersUpdateMeResponse, type UsersUpdateUserData, type UsersUpdateUserError, type UsersUpdateUserResponse, UsersGetAllUsersResponseTransformer, UsersGetMeResponseTransformer, UsersUpdateMeResponseTransformer, type PostsGetAllPostsError, type PostsGetAllPostsResponse, type PostsCreatePostData, type PostsCreatePostError, type PostsCreatePostResponse, type PostsDeletePostData, type PostsDeletePostError, type PostsDeletePostResponse, type PermissionsGetAllPermissionsError, type PermissionsGetAllPermissionsResponse, type PermissionsCreatePermissionData, type PermissionsCreatePermissionError, type PermissionsCreatePermissionResponse, type PermissionsChangePostPermissionData, type PermissionsChangePostPermissionError, type PermissionsChangePostPermissionResponse, type AuthAuthJwtLoginData, type AuthAuthJwtLoginError, type AuthAuthJwtLoginResponse, type AuthAuthJwtLogoutError, type AuthAuthJwtLogoutResponse, type AuthRegisterRegisterData, type AuthRegisterRegisterError, type AuthRegisterRegisterResponse, type AuthResetForgotPasswordData, type AuthResetForgotPasswordError, type AuthResetForgotPasswordResponse, type AuthResetResetPasswordData, type AuthResetResetPasswordError, type AuthResetResetPasswordResponse, type AuthVerifyRequestTokenData, type AuthVerifyRequestTokenError, type AuthVerifyRequestTokenResponse, type AuthVerifyVerifyData, type AuthVerifyVerifyError, type AuthVerifyVerifyResponse, AuthRegisterRegisterResponseTransformer, AuthVerifyVerifyResponseTransformer, type EventsGetAllEventsError, type EventsGetAllEventsResponse, type EventsCreateEventData, type EventsCreateEventError, type EventsCreateEventResponse, type EventsRemoveData, type EventsRemoveError, type EventsRemoveResponse, type EventsUpdateData, type EventsUpdateError, type EventsUpdateResponse, type EventsGetRandomSignupData, type EventsGetRandomSignupError, type EventsGetRandomSignupResponse, type EventsGetAllSignupsData, type EventsGetAllSignupsError, type EventsGetAllSignupsResponse, EventsGetAllEventsResponseTransformer, EventsCreateEventResponseTransformer, EventsUpdateResponseTransformer, EventsGetRandomSignupResponseTransformer, EventsGetAllSignupsResponseTransformer, type EventSignupSignupRouteData, type EventSignupSignupRouteError, type EventSignupSignupRouteResponse, type EventSignupGetAllSignupsData, type EventSignupGetAllSignupsError, type EventSignupGetAllSignupsResponse, EventSignupSignupRouteResponseTransformer, EventSignupGetAllSignupsResponseTransformer, type NewsGetAllNewsError, type NewsGetAllNewsResponse, type NewsGetAmountOfNewsData, type NewsGetAmountOfNewsError, type NewsGetAmountOfNewsResponse, type NewsGetNewsData, type NewsGetNewsError, type NewsGetNewsResponse, type NewsDeleteNewsData, type NewsDeleteNewsError, type NewsDeleteNewsResponse, type NewsUpdateNewsData, type NewsUpdateNewsError, type NewsUpdateNewsResponse, type NewsCreateNewsData, type NewsCreateNewsError, type NewsCreateNewsResponse, type NewsBumpNewsData, type NewsBumpNewsError, type NewsBumpNewsResponse, NewsGetAllNewsResponseTransformer, NewsGetAmountOfNewsResponseTransformer, NewsGetNewsResponseTransformer, NewsUpdateNewsResponseTransformer, NewsCreateNewsResponseTransformer, NewsBumpNewsResponseTransformer, type SongsGetAllSongsError, type SongsGetAllSongsResponse, type SongsCreateSongData, type SongsCreateSongError, type SongsCreateSongResponse, type SongsGetSongData, type SongsGetSongError, type SongsGetSongResponse, type SongsDeleteSongData, type SongsDeleteSongError, type SongsDeleteSongResponse, type SongsUpdateSongData, type SongsUpdateSongError, type SongsUpdateSongResponse, type SongsCategoryGetAllSongCategoriesError, type SongsCategoryGetAllSongCategoriesResponse, type SongsCategoryCreateSongCategoryData, type SongsCategoryCreateSongCategoryError, type SongsCategoryCreateSongCategoryResponse, type SongsCategoryGetSongCategoryData, type SongsCategoryGetSongCategoryError, type SongsCategoryGetSongCategoryResponse, type SongsCategoryDeleteSongCategoryData, type SongsCategoryDeleteSongCategoryError, type SongsCategoryDeleteSongCategoryResponse, type SongsCategoryUpdateSongCategoryData, type SongsCategoryUpdateSongCategoryError, type SongsCategoryUpdateSongCategoryResponse, type ImgUploadImageData, type ImgUploadImageError, type ImgUploadImageResponse, type ImgDeleteImageData, type ImgDeleteImageError, type ImgDeleteImageResponse, type ImgGetImageData, type ImgGetImageError, type ImgGetImageResponse, type AlbumsCreateAlbumData, type AlbumsCreateAlbumError, type AlbumsCreateAlbumResponse, type AlbumsGetOneAlbumData, type AlbumsGetOneAlbumError, type AlbumsGetOneAlbumResponse, type AlbumsGetAlbumsError, type AlbumsGetAlbumsResponse, type AlbumsDeleteOneAlbumData, type AlbumsDeleteOneAlbumError, type AlbumsDeleteOneAlbumResponse, type AdsGetAllAdsError, type AdsGetAllAdsResponse, type AdsCreateAdData, type AdsCreateAdError, type AdsCreateAdResponse, type AdsGetAdByIdData, type AdsGetAdByIdError, type AdsGetAdByIdResponse, type AdsRemoveAdData, type AdsRemoveAdError, type AdsRemoveAdResponse, type AdsGetAdByUserData, type AdsGetAdByUserError, type AdsGetAdByUserResponse, type AdsGetBookAdByAuthorData, type AdsGetBookAdByAuthorError, type AdsGetBookAdByAuthorResponse, type AdsGetBookAdByTitleData, type AdsGetBookAdByTitleError, type AdsGetBookAdByTitleResponse, type AdsRemoveAdSuperUserData, type AdsRemoveAdSuperUserError, type AdsRemoveAdSuperUserResponse, type AdsUpdateAdData, type AdsUpdateAdError, type AdsUpdateAdResponse, type CarsGetAllBookingError, type CarsGetAllBookingResponse, type CarsCreateBookingData, type CarsCreateBookingError, type CarsCreateBookingResponse, type CarsGetBookingData, type CarsGetBookingError, type CarsGetBookingResponse, type CarsRemoveBookingData, type CarsRemoveBookingError, type CarsRemoveBookingResponse, type CarsUpdateBookingData, type CarsUpdateBookingError, type CarsUpdateBookingResponse, CarsGetAllBookingResponseTransformer, CarsCreateBookingResponseTransformer, CarsGetBookingResponseTransformer, CarsRemoveBookingResponseTransformer, CarsUpdateBookingResponseTransformer, type HelloRouteError, type HelloRouteResponse, type UserOnlyuserOnlyError, type UserOnlyuserOnlyResponse, type MemberOnlymemberOnlyError, type MemberOnlymemberOnlyResponse, type ManageEventOnlypermissionRouteError, type ManageEventOnlypermissionRouteResponse } from './types.gen';

export const client = createClient(createConfig());

export class UsersService {
    /**
     * Get All Users
     */
    public static getAllUsers<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<UsersGetAllUsersResponse, UsersGetAllUsersError, ThrowOnError>({
            ...options,
            url: '/users/',
            responseTransformer: UsersGetAllUsersResponseTransformer
        });
    }
    
    /**
     * Get Me
     */
    public static getMe<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<UsersGetMeResponse, UsersGetMeError, ThrowOnError>({
            ...options,
            url: '/users/me',
            responseTransformer: UsersGetMeResponseTransformer
        });
    }
    
    /**
     * Update Me
     */
    public static updateMe<ThrowOnError extends boolean = false>(options: Options<UsersUpdateMeData, ThrowOnError>) {
        return (options?.client ?? client).patch<UsersUpdateMeResponse, UsersUpdateMeError, ThrowOnError>({
            ...options,
            url: '/users/me',
            responseTransformer: UsersUpdateMeResponseTransformer
        });
    }
    
    /**
     * Update User
     */
    public static updateUser<ThrowOnError extends boolean = false>(options: Options<UsersUpdateUserData, ThrowOnError>) {
        return (options?.client ?? client).patch<UsersUpdateUserResponse, UsersUpdateUserError, ThrowOnError>({
            ...options,
            url: '/users/member-status/{user_id}'
        });
    }
    
}

export class PostsService {
    /**
     * Get All Posts
     */
    public static getAllPosts<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<PostsGetAllPostsResponse, PostsGetAllPostsError, ThrowOnError>({
            ...options,
            url: '/posts/'
        });
    }
    
    /**
     * Create Post
     */
    public static createPost<ThrowOnError extends boolean = false>(options: Options<PostsCreatePostData, ThrowOnError>) {
        return (options?.client ?? client).post<PostsCreatePostResponse, PostsCreatePostError, ThrowOnError>({
            ...options,
            url: '/posts/'
        });
    }
    
    /**
     * Delete Post
     */
    public static deletePost<ThrowOnError extends boolean = false>(options: Options<PostsDeletePostData, ThrowOnError>) {
        return (options?.client ?? client).delete<PostsDeletePostResponse, PostsDeletePostError, ThrowOnError>({
            ...options,
            url: '/posts/{post_id}'
        });
    }
    
}

export class PermissionsService {
    /**
     * Get All Permissions
     */
    public static getAllPermissions<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<PermissionsGetAllPermissionsResponse, PermissionsGetAllPermissionsError, ThrowOnError>({
            ...options,
            url: '/permissions/'
        });
    }
    
    /**
     * Create Permission
     */
    public static createPermission<ThrowOnError extends boolean = false>(options: Options<PermissionsCreatePermissionData, ThrowOnError>) {
        return (options?.client ?? client).post<PermissionsCreatePermissionResponse, PermissionsCreatePermissionError, ThrowOnError>({
            ...options,
            url: '/permissions/'
        });
    }
    
    /**
     * Change Post Permission
     */
    public static changePostPermission<ThrowOnError extends boolean = false>(options: Options<PermissionsChangePostPermissionData, ThrowOnError>) {
        return (options?.client ?? client).post<PermissionsChangePostPermissionResponse, PermissionsChangePostPermissionError, ThrowOnError>({
            ...options,
            url: '/permissions/update-permission'
        });
    }
    
}

export class AuthService {
    /**
     * Auth:Jwt.Login
     */
    public static authJwtLogin<ThrowOnError extends boolean = false>(options: Options<AuthAuthJwtLoginData, ThrowOnError>) {
        return (options?.client ?? client).post<AuthAuthJwtLoginResponse, AuthAuthJwtLoginError, ThrowOnError>({
            ...options,
            ...urlSearchParamsBodySerializer,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...options?.headers
            },
            url: '/auth/login'
        });
    }
    
    /**
     * Auth:Jwt.Logout
     */
    public static authJwtLogout<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).post<AuthAuthJwtLogoutResponse, AuthAuthJwtLogoutError, ThrowOnError>({
            ...options,
            url: '/auth/logout'
        });
    }
    
    /**
     * Register:Register
     */
    public static registerRegister<ThrowOnError extends boolean = false>(options: Options<AuthRegisterRegisterData, ThrowOnError>) {
        return (options?.client ?? client).post<AuthRegisterRegisterResponse, AuthRegisterRegisterError, ThrowOnError>({
            ...options,
            url: '/auth/register',
            responseTransformer: AuthRegisterRegisterResponseTransformer
        });
    }
    
    /**
     * Reset:Forgot Password
     */
    public static resetForgotPassword<ThrowOnError extends boolean = false>(options: Options<AuthResetForgotPasswordData, ThrowOnError>) {
        return (options?.client ?? client).post<AuthResetForgotPasswordResponse, AuthResetForgotPasswordError, ThrowOnError>({
            ...options,
            url: '/auth/forgot-password'
        });
    }
    
    /**
     * Reset:Reset Password
     */
    public static resetResetPassword<ThrowOnError extends boolean = false>(options: Options<AuthResetResetPasswordData, ThrowOnError>) {
        return (options?.client ?? client).post<AuthResetResetPasswordResponse, AuthResetResetPasswordError, ThrowOnError>({
            ...options,
            url: '/auth/reset-password'
        });
    }
    
    /**
     * Verify:Request-Token
     */
    public static verifyRequestToken<ThrowOnError extends boolean = false>(options: Options<AuthVerifyRequestTokenData, ThrowOnError>) {
        return (options?.client ?? client).post<AuthVerifyRequestTokenResponse, AuthVerifyRequestTokenError, ThrowOnError>({
            ...options,
            url: '/auth/request-verify-token'
        });
    }
    
    /**
     * Verify:Verify
     */
    public static verifyVerify<ThrowOnError extends boolean = false>(options: Options<AuthVerifyVerifyData, ThrowOnError>) {
        return (options?.client ?? client).post<AuthVerifyVerifyResponse, AuthVerifyVerifyError, ThrowOnError>({
            ...options,
            url: '/auth/verify',
            responseTransformer: AuthVerifyVerifyResponseTransformer
        });
    }
    
}

export class EventsService {
    /**
     * Get All Events
     */
    public static getAllEvents<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<EventsGetAllEventsResponse, EventsGetAllEventsError, ThrowOnError>({
            ...options,
            url: '/events/',
            responseTransformer: EventsGetAllEventsResponseTransformer
        });
    }
    
    /**
     * Create Event
     */
    public static createEvent<ThrowOnError extends boolean = false>(options: Options<EventsCreateEventData, ThrowOnError>) {
        return (options?.client ?? client).post<EventsCreateEventResponse, EventsCreateEventError, ThrowOnError>({
            ...options,
            url: '/events/',
            responseTransformer: EventsCreateEventResponseTransformer
        });
    }
    
    /**
     * Remove
     */
    public static remove<ThrowOnError extends boolean = false>(options: Options<EventsRemoveData, ThrowOnError>) {
        return (options?.client ?? client).delete<EventsRemoveResponse, EventsRemoveError, ThrowOnError>({
            ...options,
            url: '/events/{event_id}'
        });
    }
    
    /**
     * Update
     */
    public static update<ThrowOnError extends boolean = false>(options: Options<EventsUpdateData, ThrowOnError>) {
        return (options?.client ?? client).patch<EventsUpdateResponse, EventsUpdateError, ThrowOnError>({
            ...options,
            url: '/events/{event_id}',
            responseTransformer: EventsUpdateResponseTransformer
        });
    }
    
    /**
     * Get Random Signup
     */
    public static getRandomSignup<ThrowOnError extends boolean = false>(options: Options<EventsGetRandomSignupData, ThrowOnError>) {
        return (options?.client ?? client).get<EventsGetRandomSignupResponse, EventsGetRandomSignupError, ThrowOnError>({
            ...options,
            url: '/events/{event_id}',
            responseTransformer: EventsGetRandomSignupResponseTransformer
        });
    }
    
    /**
     * Get All Signups
     */
    public static getAllSignups<ThrowOnError extends boolean = false>(options: Options<EventsGetAllSignupsData, ThrowOnError>) {
        return (options?.client ?? client).get<EventsGetAllSignupsResponse, EventsGetAllSignupsError, ThrowOnError>({
            ...options,
            url: '/events/all/{event_id}',
            responseTransformer: EventsGetAllSignupsResponseTransformer
        });
    }
    
}

export class EventSignupService {
    /**
     * Signup Route
     */
    public static signupRoute<ThrowOnError extends boolean = false>(options: Options<EventSignupSignupRouteData, ThrowOnError>) {
        return (options?.client ?? client).post<EventSignupSignupRouteResponse, EventSignupSignupRouteError, ThrowOnError>({
            ...options,
            url: '/event-signup/{event_id}',
            responseTransformer: EventSignupSignupRouteResponseTransformer
        });
    }
    
    /**
     * Get All Signups
     */
    public static getAllSignups<ThrowOnError extends boolean = false>(options: Options<EventSignupGetAllSignupsData, ThrowOnError>) {
        return (options?.client ?? client).get<EventSignupGetAllSignupsResponse, EventSignupGetAllSignupsError, ThrowOnError>({
            ...options,
            url: '/event-signup/{event_id}',
            responseTransformer: EventSignupGetAllSignupsResponseTransformer
        });
    }
    
}

export class NewsService {
    /**
     * Get All News
     */
    public static getAllNews<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<NewsGetAllNewsResponse, NewsGetAllNewsError, ThrowOnError>({
            ...options,
            url: '/news/all',
            responseTransformer: NewsGetAllNewsResponseTransformer
        });
    }
    
    /**
     * Get Amount Of News
     */
    public static getAmountOfNews<ThrowOnError extends boolean = false>(options: Options<NewsGetAmountOfNewsData, ThrowOnError>) {
        return (options?.client ?? client).get<NewsGetAmountOfNewsResponse, NewsGetAmountOfNewsError, ThrowOnError>({
            ...options,
            url: '/news/amount/{amount}',
            responseTransformer: NewsGetAmountOfNewsResponseTransformer
        });
    }
    
    /**
     * Get News
     */
    public static getNews<ThrowOnError extends boolean = false>(options: Options<NewsGetNewsData, ThrowOnError>) {
        return (options?.client ?? client).get<NewsGetNewsResponse, NewsGetNewsError, ThrowOnError>({
            ...options,
            url: '/news/{news_id}',
            responseTransformer: NewsGetNewsResponseTransformer
        });
    }
    
    /**
     * Delete News
     */
    public static deleteNews<ThrowOnError extends boolean = false>(options: Options<NewsDeleteNewsData, ThrowOnError>) {
        return (options?.client ?? client).delete<NewsDeleteNewsResponse, NewsDeleteNewsError, ThrowOnError>({
            ...options,
            url: '/news/{news_id}'
        });
    }
    
    /**
     * Update News
     */
    public static updateNews<ThrowOnError extends boolean = false>(options: Options<NewsUpdateNewsData, ThrowOnError>) {
        return (options?.client ?? client).patch<NewsUpdateNewsResponse, NewsUpdateNewsError, ThrowOnError>({
            ...options,
            url: '/news/{news_id}',
            responseTransformer: NewsUpdateNewsResponseTransformer
        });
    }
    
    /**
     * Create News
     */
    public static createNews<ThrowOnError extends boolean = false>(options: Options<NewsCreateNewsData, ThrowOnError>) {
        return (options?.client ?? client).post<NewsCreateNewsResponse, NewsCreateNewsError, ThrowOnError>({
            ...options,
            url: '/news/',
            responseTransformer: NewsCreateNewsResponseTransformer
        });
    }
    
    /**
     * Bump news to top of news-feed
     */
    public static bumpNews<ThrowOnError extends boolean = false>(options: Options<NewsBumpNewsData, ThrowOnError>) {
        return (options?.client ?? client).patch<NewsBumpNewsResponse, NewsBumpNewsError, ThrowOnError>({
            ...options,
            url: '/news/bump/{news_id}',
            responseTransformer: NewsBumpNewsResponseTransformer
        });
    }
    
}

export class SongsService {
    /**
     * Get All Songs
     */
    public static getAllSongs<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<SongsGetAllSongsResponse, SongsGetAllSongsError, ThrowOnError>({
            ...options,
            url: '/songs/'
        });
    }
    
    /**
     * Create Song
     */
    public static createSong<ThrowOnError extends boolean = false>(options: Options<SongsCreateSongData, ThrowOnError>) {
        return (options?.client ?? client).post<SongsCreateSongResponse, SongsCreateSongError, ThrowOnError>({
            ...options,
            url: '/songs/'
        });
    }
    
    /**
     * Get Song
     */
    public static getSong<ThrowOnError extends boolean = false>(options: Options<SongsGetSongData, ThrowOnError>) {
        return (options?.client ?? client).get<SongsGetSongResponse, SongsGetSongError, ThrowOnError>({
            ...options,
            url: '/songs/{song_id}'
        });
    }
    
    /**
     * Delete Song
     */
    public static deleteSong<ThrowOnError extends boolean = false>(options: Options<SongsDeleteSongData, ThrowOnError>) {
        return (options?.client ?? client).delete<SongsDeleteSongResponse, SongsDeleteSongError, ThrowOnError>({
            ...options,
            url: '/songs/{song_id}'
        });
    }
    
    /**
     * Update Song
     */
    public static updateSong<ThrowOnError extends boolean = false>(options: Options<SongsUpdateSongData, ThrowOnError>) {
        return (options?.client ?? client).patch<SongsUpdateSongResponse, SongsUpdateSongError, ThrowOnError>({
            ...options,
            url: '/songs/{song_id}'
        });
    }
    
}

export class SongsCategoryService {
    /**
     * Get All Song Categories
     */
    public static getAllSongCategories<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<SongsCategoryGetAllSongCategoriesResponse, SongsCategoryGetAllSongCategoriesError, ThrowOnError>({
            ...options,
            url: '/songs-category/'
        });
    }
    
    /**
     * Create Song Category
     */
    public static createSongCategory<ThrowOnError extends boolean = false>(options: Options<SongsCategoryCreateSongCategoryData, ThrowOnError>) {
        return (options?.client ?? client).post<SongsCategoryCreateSongCategoryResponse, SongsCategoryCreateSongCategoryError, ThrowOnError>({
            ...options,
            url: '/songs-category/'
        });
    }
    
    /**
     * Get Song Category
     */
    public static getSongCategory<ThrowOnError extends boolean = false>(options: Options<SongsCategoryGetSongCategoryData, ThrowOnError>) {
        return (options?.client ?? client).get<SongsCategoryGetSongCategoryResponse, SongsCategoryGetSongCategoryError, ThrowOnError>({
            ...options,
            url: '/songs-category/{category_id}'
        });
    }
    
    /**
     * Delete Song Category
     */
    public static deleteSongCategory<ThrowOnError extends boolean = false>(options: Options<SongsCategoryDeleteSongCategoryData, ThrowOnError>) {
        return (options?.client ?? client).delete<SongsCategoryDeleteSongCategoryResponse, SongsCategoryDeleteSongCategoryError, ThrowOnError>({
            ...options,
            url: '/songs-category/{category_id}'
        });
    }
    
    /**
     * Update Song Category
     */
    public static updateSongCategory<ThrowOnError extends boolean = false>(options: Options<SongsCategoryUpdateSongCategoryData, ThrowOnError>) {
        return (options?.client ?? client).patch<SongsCategoryUpdateSongCategoryResponse, SongsCategoryUpdateSongCategoryError, ThrowOnError>({
            ...options,
            url: '/songs-category/{category_id}'
        });
    }
    
}

export class ImgService {
    /**
     * Upload Image
     */
    public static uploadImage<ThrowOnError extends boolean = false>(options: Options<ImgUploadImageData, ThrowOnError>) {
        return (options?.client ?? client).post<ImgUploadImageResponse, ImgUploadImageError, ThrowOnError>({
            ...options,
            ...formDataBodySerializer,
            headers: {
                'Content-Type': null,
                ...options?.headers
            },
            url: '/img/'
        });
    }
    
    /**
     * Delete Image
     */
    public static deleteImage<ThrowOnError extends boolean = false>(options: Options<ImgDeleteImageData, ThrowOnError>) {
        return (options?.client ?? client).delete<ImgDeleteImageResponse, ImgDeleteImageError, ThrowOnError>({
            ...options,
            url: '/img/{id}'
        });
    }
    
    /**
     * Get Image
     */
    public static getImage<ThrowOnError extends boolean = false>(options: Options<ImgGetImageData, ThrowOnError>) {
        return (options?.client ?? client).get<ImgGetImageResponse, ImgGetImageError, ThrowOnError>({
            ...options,
            url: '/img/{id}'
        });
    }
    
}

export class AlbumsService {
    /**
     * Create Album
     */
    public static createAlbum<ThrowOnError extends boolean = false>(options: Options<AlbumsCreateAlbumData, ThrowOnError>) {
        return (options?.client ?? client).post<AlbumsCreateAlbumResponse, AlbumsCreateAlbumError, ThrowOnError>({
            ...options,
            url: '/albums/'
        });
    }
    
    /**
     * Get One Album
     */
    public static getOneAlbum<ThrowOnError extends boolean = false>(options: Options<AlbumsGetOneAlbumData, ThrowOnError>) {
        return (options?.client ?? client).get<AlbumsGetOneAlbumResponse, AlbumsGetOneAlbumError, ThrowOnError>({
            ...options,
            url: '/albums/'
        });
    }
    
    /**
     * Get Albums
     */
    public static getAlbums<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<AlbumsGetAlbumsResponse, AlbumsGetAlbumsError, ThrowOnError>({
            ...options,
            url: '/albums/all'
        });
    }
    
    /**
     * Delete One Album
     */
    public static deleteOneAlbum<ThrowOnError extends boolean = false>(options: Options<AlbumsDeleteOneAlbumData, ThrowOnError>) {
        return (options?.client ?? client).delete<AlbumsDeleteOneAlbumResponse, AlbumsDeleteOneAlbumError, ThrowOnError>({
            ...options,
            url: '/albums/{album_id}'
        });
    }
    
}

export class AdsService {
    /**
     * Get All Ads
     */
    public static getAllAds<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<AdsGetAllAdsResponse, AdsGetAllAdsError, ThrowOnError>({
            ...options,
            url: '/ad/'
        });
    }
    
    /**
     * Create Ad
     */
    public static createAd<ThrowOnError extends boolean = false>(options: Options<AdsCreateAdData, ThrowOnError>) {
        return (options?.client ?? client).post<AdsCreateAdResponse, AdsCreateAdError, ThrowOnError>({
            ...options,
            url: '/ad/'
        });
    }
    
    /**
     * Get Ad By Id
     */
    public static getAdById<ThrowOnError extends boolean = false>(options: Options<AdsGetAdByIdData, ThrowOnError>) {
        return (options?.client ?? client).get<AdsGetAdByIdResponse, AdsGetAdByIdError, ThrowOnError>({
            ...options,
            url: '/ad/{id}'
        });
    }
    
    /**
     * Remove Ad
     */
    public static removeAd<ThrowOnError extends boolean = false>(options: Options<AdsRemoveAdData, ThrowOnError>) {
        return (options?.client ?? client).delete<AdsRemoveAdResponse, AdsRemoveAdError, ThrowOnError>({
            ...options,
            url: '/ad/{id}'
        });
    }
    
    /**
     * Get Ad By User
     */
    public static getAdByUser<ThrowOnError extends boolean = false>(options: Options<AdsGetAdByUserData, ThrowOnError>) {
        return (options?.client ?? client).get<AdsGetAdByUserResponse, AdsGetAdByUserError, ThrowOnError>({
            ...options,
            url: '/ad/username/{username}'
        });
    }
    
    /**
     * Get Book Ad By Author
     */
    public static getBookAdByAuthor<ThrowOnError extends boolean = false>(options: Options<AdsGetBookAdByAuthorData, ThrowOnError>) {
        return (options?.client ?? client).get<AdsGetBookAdByAuthorResponse, AdsGetBookAdByAuthorError, ThrowOnError>({
            ...options,
            url: '/ad/authorname/{authorname}'
        });
    }
    
    /**
     * Get Book Ad By Title
     */
    public static getBookAdByTitle<ThrowOnError extends boolean = false>(options: Options<AdsGetBookAdByTitleData, ThrowOnError>) {
        return (options?.client ?? client).get<AdsGetBookAdByTitleResponse, AdsGetBookAdByTitleError, ThrowOnError>({
            ...options,
            url: '/ad/title/{stitle}'
        });
    }
    
    /**
     * Remove Ad Super User
     */
    public static removeAdSuperUser<ThrowOnError extends boolean = false>(options: Options<AdsRemoveAdSuperUserData, ThrowOnError>) {
        return (options?.client ?? client).delete<AdsRemoveAdSuperUserResponse, AdsRemoveAdSuperUserError, ThrowOnError>({
            ...options,
            url: '/ad/manage-route/{id}'
        });
    }
    
    /**
     * Update Ad
     */
    public static updateAd<ThrowOnError extends boolean = false>(options: Options<AdsUpdateAdData, ThrowOnError>) {
        return (options?.client ?? client).put<AdsUpdateAdResponse, AdsUpdateAdError, ThrowOnError>({
            ...options,
            url: '/ad/updateAd/{id}'
        });
    }
    
}

export class CarsService {
    /**
     * Get All Booking
     */
    public static getAllBooking<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<CarsGetAllBookingResponse, CarsGetAllBookingError, ThrowOnError>({
            ...options,
            url: '/car/',
            responseTransformer: CarsGetAllBookingResponseTransformer
        });
    }
    
    /**
     * Create Booking
     */
    public static createBooking<ThrowOnError extends boolean = false>(options: Options<CarsCreateBookingData, ThrowOnError>) {
        return (options?.client ?? client).post<CarsCreateBookingResponse, CarsCreateBookingError, ThrowOnError>({
            ...options,
            url: '/car/',
            responseTransformer: CarsCreateBookingResponseTransformer
        });
    }
    
    /**
     * Get Booking
     */
    public static getBooking<ThrowOnError extends boolean = false>(options: Options<CarsGetBookingData, ThrowOnError>) {
        return (options?.client ?? client).get<CarsGetBookingResponse, CarsGetBookingError, ThrowOnError>({
            ...options,
            url: '/car/{booking_id}',
            responseTransformer: CarsGetBookingResponseTransformer
        });
    }
    
    /**
     * Remove Booking
     */
    public static removeBooking<ThrowOnError extends boolean = false>(options: Options<CarsRemoveBookingData, ThrowOnError>) {
        return (options?.client ?? client).delete<CarsRemoveBookingResponse, CarsRemoveBookingError, ThrowOnError>({
            ...options,
            url: '/car/{booking_id}',
            responseTransformer: CarsRemoveBookingResponseTransformer
        });
    }
    
    /**
     * Update Booking
     */
    public static updateBooking<ThrowOnError extends boolean = false>(options: Options<CarsUpdateBookingData, ThrowOnError>) {
        return (options?.client ?? client).patch<CarsUpdateBookingResponse, CarsUpdateBookingError, ThrowOnError>({
            ...options,
            url: '/car/{booking_id}',
            responseTransformer: CarsUpdateBookingResponseTransformer
        });
    }
    
}

export class DefaultService {
    /**
     * Hello Route
     */
    public static helloRoute<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<HelloRouteResponse, HelloRouteError, ThrowOnError>({
            ...options,
            url: '/'
        });
    }
    
    /**
     * User Only
     */
    public static nlyuserOnly<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<UserOnlyuserOnlyResponse, UserOnlyuserOnlyError, ThrowOnError>({
            ...options,
            url: '/user-only'
        });
    }
    
    /**
     * Member Only
     */
    public static nlymemberOnly<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<MemberOnlymemberOnlyResponse, MemberOnlymemberOnlyError, ThrowOnError>({
            ...options,
            url: '/member-only'
        });
    }
    
    /**
     * Permission Route
     */
    public static ventOnlypermissionRoute<ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) {
        return (options?.client ?? client).get<ManageEventOnlypermissionRouteResponse, ManageEventOnlypermissionRouteError, ThrowOnError>({
            ...options,
            url: '/manage-event-only'
        });
    }
    
}