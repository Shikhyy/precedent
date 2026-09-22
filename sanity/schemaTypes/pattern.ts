import { defineType, defineField } from "sanity";

export const pattern = defineType({
  name: "pattern",
  title: "Pattern",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "aliases",
      title: "Aliases",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});
