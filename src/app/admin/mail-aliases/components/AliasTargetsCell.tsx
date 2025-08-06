"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import {
	aliasAddMemberMutation,
	aliasRemoveMemberMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AliasTargetsCellProps {
	alias: string;
	targets: string[];
	onRefetch: () => void;
}

export function AliasTargetsCell({
	alias,
	targets,
	onRefetch,
}: AliasTargetsCellProps) {
	const { t } = useTranslation();
	const [editTarget, setEditTarget] = useState<{
		source: string;
		target: string;
	} | null>(null);
	const [editValue, setEditValue] = useState<string>("");
	const [addToSource, setAddToSource] = useState<string>("");

	const addTargetMutation = useMutation({
		...aliasAddMemberMutation(),
		onSuccess: () => {
			toast.success(t("admin:mail_aliases.add_target_success"));
			onRefetch();
		},
		onError: () => {
			toast.error(t("admin:mail_aliases.add_target_error"));
		},
	});

	const removeTargetMutation = useMutation({
		...aliasRemoveMemberMutation(),
		onSuccess: () => {
			toast.success(t("admin:mail_aliases.remove_target_success"));
			onRefetch();
		},
		onError: () => {
			toast.error(t("admin:mail_aliases.remove_target_error"));
		},
	});

	const removeTarget = (targetToRemove: string) => {
		removeTargetMutation.mutate({
			path: { alias_email: alias },
			query: { member_email: targetToRemove },
		});
	};

	const handlePlusClick = () => {
		setEditTarget({ source: alias, target: "" });
		setEditValue("");
		setAddToSource(alias);
	};

	const handleEditTarget = (target: string) => {
		setEditTarget({ source: alias, target });
		setEditValue(target);
	};

	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditValue(e.target.value);
	};

	const handleUpdateTarget = () => {
		// Remove and then add the updated target
		if (editTarget && editValue) {
			removeTargetMutation.mutate(
				{
					path: { alias_email: editTarget.source },
					query: { member_email: editTarget.target },
				},
				{
					onSuccess: () => {
						addTargetMutation.mutate({
							path: { alias_email: editTarget.source },
							query: { member_email: editValue.trim() },
						});
					},
				},
			);
		}
	};

	const handleEditBlur = () => {
		if (editValue.trim() === "") {
			setEditTarget(null);
			setAddToSource("");
			return;
		}
		if (editTarget) {
			if (editTarget.target === "") {
				addTargetMutation.mutate({
					path: { alias_email: editTarget.source },
					query: { member_email: editValue.trim() },
				});
			} else {
				handleUpdateTarget();
			}
		}
		setEditTarget(null);
		setAddToSource("");
	};

	const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			if (editValue.trim() === "") {
				setEditTarget(null);
				setAddToSource("");
				return;
			}
			if (editTarget) {
				if (editTarget.target === "") {
					addTargetMutation.mutate({
						path: { alias_email: editTarget.source },
						query: { member_email: editValue.trim() },
					});
				} else {
					handleUpdateTarget();
				}
			}
			setEditTarget(null);
			setAddToSource("");
		}
	};

	return (
		<div className="space-y-1">
			{targets.sort().map((target) => {
				const isEditing =
					editTarget &&
					editTarget.source === alias &&
					editTarget.target === target;
				return (
					<div
						key={target}
						className="flex items-center gap-2 text-md bg-accent p-4 rounded-lg"
					>
						{isEditing ? (
							<Input
								value={editValue}
								onChange={handleEditChange}
								onBlur={handleEditBlur}
								onKeyDown={handleEditKeyDown}
								className="flex-1"
								autoFocus
							/>
						) : (
							<Button
								variant="outline"
								className="flex-1 justify-start"
								onClick={() => handleEditTarget(target)}
							>
								{target}
							</Button>
						)}
						<Button
							variant="destructive"
							size="sm"
							className="h-8 w-8 p-0 text-destructive-foreground hover:text-foreground"
							onClick={(e) => {
								e.stopPropagation();
								removeTarget(target);
							}}
						>
							<Minus className="h-6 w-6" />
						</Button>
					</div>
				);
			})}
			{editTarget && addToSource === alias && (
				<div className="flex items-center gap-2 text-md bg-accent p-4 rounded-lg">
					<Input
						value={editValue}
						onChange={handleEditChange}
						onBlur={handleEditBlur}
						onKeyDown={handleEditKeyDown}
						className="flex-1"
						autoFocus
					/>
				</div>
			)}
			<Button
				variant="ghost"
				size="sm"
				className="h-10 w-10 p-0 text-muted-foreground hover:text-primary bg-muted rounded-full border border-muted-foreground/20 shadow transition-colors duration-150 focus:ring-2 focus:ring-primary focus:outline-none mt-1"
				onClick={(e) => {
					e.stopPropagation();
					handlePlusClick();
				}}
			>
				<Plus className="h-3 w-3" />
			</Button>
		</div>
	);
}
