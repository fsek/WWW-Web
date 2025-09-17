"use client";

import type { AdminUserRead } from "@/api";
import { adminGetAllUsersOptions } from "@/api/@tanstack/react-query.gen";
import { AdminChooseMultPosts } from "@/widgets/AdminChooseMultPosts";
import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  type ColumnFiltersState,
  createColumnHelper,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import UserPostsEditForm from "./UserPostsEditForm";
import AdminPage from "@/widgets/AdminPage";
import { useState } from "react";

const columnHelper = createColumnHelper<AdminUserRead>();

export default function UserPostsPage() {
  const { t, i18n } = useTranslation();

  // biome-ignore lint/suspicious/noExplicitAny: any is kind of needed here
  const columns: ColumnDef<AdminUserRead, any>[] = [
    columnHelper.accessor("id", {
      header: t("admin:id"),
      size: 50,
    }),
    columnHelper.accessor("first_name", {
      header: t("admin:first_name"),
      size: 150,
    }),
    columnHelper.accessor("last_name", {
      header: t("admin:last_name"),
    }),
    {
      id: "hidden_column", // see tableOptions below
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    },
    columnHelper.accessor("email", {
      header: t("admin:email"),
    }),
    columnHelper.accessor("stil_id", {
      header: t("admin:stil_id"),
      size: 100,
    }),
    columnHelper.accessor("program", {
      header: t("admin:program"),
      size: 75,
    }),
    columnHelper.accessor("start_year", {
      header: t("admin:start_year"),
      size: 75,
    }),
    columnHelper.accessor("posts", {
      header: t("admin:user-posts.table_header"),
      cell: (info) => {
        const posts = info.getValue() as
          | { name_sv?: string; name_en?: string }[]
          | undefined;
        if (!posts || posts.length === 0) return t("admin:no_posts");
        const lang = i18n.language;
        return posts
          .map((post) =>
            lang === "sv"
              ? post.name_sv || post.name_en || "-"
              : post.name_en || post.name_sv || "-",
          )
          .join(", ");
      },
      filterFn: (row, id, filter) => {
        if (!filter.length) return true; // no filter, show all

        // O(n^2). Let the browser suffer
        return (filter as number[]).some(
          (postId) =>
            row.original.posts.findIndex((p) => p.id === postId) !== -1,
        );
      },
      size: 200,
    }),
  ];

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  return (
    <AdminPage
      title={t("admin:user-posts.list")}
      description={t("admin:user-posts.list_description")}
      queryResult={useQuery({
        ...adminGetAllUsersOptions(),
      })}
      columns={columns}
      searchPlaceholder={t("admin:user-posts.search_placeholder")}
      editComponent={UserPostsEditForm}
      headerButtons={
        <AdminChooseMultPosts
          value={
            (columnFilters.find((f) => f.id === "posts")?.value as number[]) ||
            []
          }
          onChange={(postIds) => {
            setColumnFilters((old) => {
              const otherFilters = old.filter((f) => f.id !== "posts");
              if (postIds.length === 0) return otherFilters;
              return [...otherFilters, { id: "posts", value: postIds }];
            });
          }}
        />
      }
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      columnVisibility={{ hidden_column: false }}
    />
  );
}
