import { defineType, defineField, defineArrayMember } from "sanity";

export const claim = defineType({
  name: "claim",
  title: "Claim",
  type: "document",
  fields: [
    defineField({
      name: "pattern",
      title: "Pattern",
      type: "reference",
      to: [{ type: "pattern" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "reference",
      to: [{ type: "source" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "statement",
      title: "Statement",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(280),
    }),
    defineField({
      name: "stance",
      title: "Stance",
      type: "string",
      options: {
        list: [
          { title: "Safe", value: "safe" },
          { title: "Unsafe", value: "unsafe" },
          { title: "Deprecated", value: "deprecated" },
          { title: "Mixed", value: "mixed" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "fromVersion",
      title: "From Version Key",
      type: "number",
      description: "e.g. 8020 for 0.8.20",
    }),
    defineField({
      name: "toVersion",
      title: "To Version Key",
      type: "number",
      description: "e.g. 8028 for 0.8.28",
    }),
    defineField({
      name: "evmFork",
      title: "EVM Fork Scope",
      type: "string",
    }),
    defineField({
      name: "supersedes",
      title: "Supersedes Claims",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "claim" }] })],
    }),
    defineField({
      name: "contradicts",
      title: "Contradicts Claims",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "claim" }] })],
    }),
    defineField({
      name: "confidence",
      title: "Confidence",
      type: "string",
      initialValue: "needs-review",
      options: {
        list: [
          { title: "Verified", value: "verified" },
          { title: "Needs Review", value: "needs-review" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
});
