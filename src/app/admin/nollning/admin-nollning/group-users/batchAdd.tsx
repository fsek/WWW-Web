"use client";

import type { AdminUserRead, GroupAddUser, GroupUserRead } from "@/api";
import { adminGetAllUsersOptions } from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	groupUserTypes,
	type GroupUserTypes,
	toGroupUserType,
} from "./searchBar";

interface Props {
	excludedFromSearch?: GroupUserRead[];
	onSubmit?: (payload: {
		users: AdminUserRead[];
		groupUserType: GroupAddUser["group_user_type"];
		unmatchedValues: string[];
	}) => Promise<void> | void;
}

const normalizeIdentifier = (value: string) => value.trim().toLowerCase();

const parseIdentifiers = (value: string) =>
	Array.from(
		new Set(
			value
				.split(/[\n,]/)
				.map((identifier) => identifier.trim())
				.filter(Boolean), // remove empty entries
		),
	);

export default function BatchAddBox({
	excludedFromSearch = [],
	onSubmit,
}: Props) {
	const { t } = useTranslation("admin");
	const [identifierInput, setIdentifierInput] = useState("");
	const [groupUserType, setGroupUserType] = useState<GroupUserTypes>("Mentee");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const allUsersQuery = useQuery({
		...adminGetAllUsersOptions(),
		enabled: identifierInput.trim().length > 0,
	});
	const allUsers = allUsersQuery.data ?? [];

	const excludedUserIds = useMemo(
		() => new Set(excludedFromSearch.map((groupUser) => groupUser.user.id)),
		[excludedFromSearch],
	);

	const availableUsers = useMemo(
		() =>
			allUsers.filter((user) => {
				if (excludedUserIds.has(user.id)) {
					return false;
				}
				return true;
			}),
		[allUsers, excludedUserIds],
	);

	const identifierList = useMemo(
		() => parseIdentifiers(identifierInput),
		[identifierInput],
	);

	const userLookup = useMemo(() => {
		const lookup = new Map<string, AdminUserRead[]>();

		// We want multiple users who share an identifier (for whatever reason) to be added at the same time,
		// so we check for existing entries in the lookup and push to the array instead of replacing it
		const appendToLookup = (key: string, user: AdminUserRead) => {
			const normalized = normalizeIdentifier(key);
			const existing = lookup.get(normalized) || [];
			existing.push(user);
			lookup.set(normalized, existing);
		};

		for (const user of availableUsers) {
			appendToLookup(user.email, user);
			if (user.stil_id) {
				appendToLookup(user.stil_id, user);
			}
		}
		return lookup;
	}, [availableUsers]);

	const resolvedUsers = useMemo(() => {
		const selectedUsers = new Map<number, AdminUserRead>();
		for (const identifier of identifierList) {
			const users = userLookup.get(normalizeIdentifier(identifier));
			if (users) {
				for (const user of users) {
					selectedUsers.set(user.id, user);
				}
			}
		}
		return Array.from(selectedUsers.values());
	}, [identifierList, userLookup]);

	const unmatchedValues = useMemo(
		() =>
			identifierList.filter(
				(identifier) => !userLookup.has(normalizeIdentifier(identifier)),
			),
		[identifierList, userLookup],
	);

	const handleSubmit = async () => {
		if (!onSubmit || resolvedUsers.length === 0) {
			return;
		}
		setIsSubmitting(true);
		try {
			await onSubmit({
				users: resolvedUsers,
				groupUserType,
				unmatchedValues,
			});
			setIdentifierInput("");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col space-y-4">
			<Select
				onValueChange={(value) => setGroupUserType(toGroupUserType(value))}
				value={groupUserType}
			>
				<SelectTrigger className="w-full bg-white max-w-sm">
					<SelectValue
						placeholder={t("nollning.group_members.select_role_placeholder")}
					/>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="Mentee">
						{t("nollning.group_members.add_as_mentee")}
					</SelectItem>
					<SelectItem value="Mentor">
						{t("nollning.group_members.add_as_mentor")}
					</SelectItem>
					<SelectItem value="Default">
						{t("nollning.group_members.add_as_standard")}
					</SelectItem>
				</SelectContent>
			</Select>
			<div className="space-y-2">
				<p className="text-sm text-muted-foreground">
					{t("nollning.group_members.batch_add_members.description")}
				</p>
				<Textarea
					className="min-h-28 bg-white"
					placeholder={t(
						"nollning.group_members.batch_add_members.input_placeholder",
					)}
					value={identifierInput}
					onChange={(event) => {
						setIdentifierInput(event.target.value);
					}}
				/>
			</div>
			<div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
				<div className="flex items-center justify-between gap-3 text-sm">
					<p className="font-medium text-foreground">
						{t("nollning.group_members.batch_add_members.matched_preview", {
							count: resolvedUsers.length,
						})}
					</p>
				</div>
				{resolvedUsers.length > 0 ? (
					<div className="space-y-2">
						<p className="text-sm font-medium">
							{t("nollning.group_members.batch_add_members.selected_users")}
						</p>
						<ul className="space-y-1 text-sm text-muted-foreground">
							{resolvedUsers.slice(0, 5).map((user) => (
								<li key={user.id}>
									{user.first_name} {user.last_name} · {user.email}
									{user.stil_id ? ` · ${user.stil_id}` : ""}
								</li>
							))}
							{resolvedUsers.length > 5 ? (
								<li>
									{t("nollning.group_members.batch_add_members.more_users", {
										count: resolvedUsers.length - 5,
									})}
								</li>
							) : null}
						</ul>
					</div>
				) : null}
				{unmatchedValues.length > 0 ? (
					<div className="space-y-2">
						<p className="text-sm font-medium text-destructive">
							{t("nollning.group_members.batch_add_members.unmatched_values")}
						</p>
						<p className="text-sm text-destructive/90 wrap-break-word">
							{unmatchedValues.join(", ")}
						</p>
					</div>
				) : null}
			</div>
			<Button
				className="w-full max-w-sm"
				disabled={!onSubmit || resolvedUsers.length === 0 || isSubmitting}
				onClick={() => {
					void handleSubmit();
				}}
			>
				{isSubmitting
					? t("nollning.group_members.batch_add_members.submitting")
					: t("nollning.group_members.batch_add_members.submit")}
			</Button>
		</div>
	);
}
