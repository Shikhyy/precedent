import { defineType, defineField } from "sanity";

export const source = defineType({
  name: "source",
  title: "Source",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publisher",
      title: "Publisher",
      type: "string",
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Documentation", value: "docs" },
          { title: "Ethereum Improvement Proposal (EIP)", value: "eip" },
          { title: "Audit Report", value: "audit" },
          { title: "Release Notes", value: "release-notes" },
          { title: "Blog / Security Advisory", value: "blog" },
        ],
      },
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "license",
      title: "License",
      type: "string",
    }),
  ],
});
