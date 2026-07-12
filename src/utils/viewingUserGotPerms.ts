import type { AdminUserRead } from "@/api";
import { ApiError } from "@/types/api-error";

export default function viewingUserGotPerms(
	userData: AdminUserRead | undefined,
	userError: ApiError | null,
	userIsFetching: boolean,
	permissionTarget = "user",
): boolean {
	if (userIsFetching) {
		return false;
	}
	if (userError !== null || !userData) {
		return false;
	}

	if (userData.posts) {
		const hasPerm = userData.posts.some((post) => {
			const found = post.permissions.some((permission) => {
				const match =
					permission.action.toLowerCase() === "manage" &&
					permission.target.toLowerCase() === permissionTarget.toLowerCase();
				return match;
			});
			return found;
		});
		return hasPerm;
	}
	return false;
}
