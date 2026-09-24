import { groq } from "next-sanity";

// Retrieve all patterns for selector chips and search
export const GET_PATTERNS_QUERY = groq`
  *[_type == "pattern"]{
    _id,
    name,
    "slug": slug.current,
    summary,
    aliases
  } | order(name asc)
`;

// Retrieve a single pattern by ID
export const GET_PATTERN_BY_ID_QUERY = groq`
  *[_type == "pattern" && _id == $id][0]{
    _id,
    name,
    "slug": slug.current,
    summary,
    aliases
  }
`;

// Lookup patterns by query or alias match
export const PATTERN_LOOKUP_QUERY = groq`
  *[_type == "pattern" && (name match $q || $q in aliases)][0..4]{
    _id,
    name,
    "slug": slug.current,
    summary,
    aliases
  }
`;

// Core case-law query: in-scope verified claims for a pattern and version
export const IN_SCOPE_CLAIMS_QUERY = groq`
  *[_type == "claim" && confidence == "verified"
    && pattern._ref == $patternId
    && (!defined(fromVersion) || fromVersion <= $v)
    && (!defined(toVersion)   || toVersion   >= $v)]{
      _id,
      statement,
      stance,
      fromVersion,
      toVersion,
      evmFork,
      "source": source->{
        _id,
        title,
        url,
        publisher,
        kind,
        publishedAt,
        license
      },
      "supersedes": supersedes[]._ref,
      "contradicts": contradicts[]._ref,
      "supersededBy": *[_type == "claim" && ^._id in supersedes[]._ref]._id
    } | order(source.publishedAt desc)
`;

// Hydrate claims and referenced sources by ID for UI rendering
export const HYDRATE_CLAIMS_QUERY = groq`
  *[_type == "claim" && _id in $claimIds]{
    _id,
    statement,
    stance,
    fromVersion,
    toVersion,
    evmFork,
    "pattern": pattern->{
      _id,
      name,
      "slug": slug.current
    },
    "source": source->{
      _id,
      title,
      url,
      publisher,
      kind,
      publishedAt,
      license
    },
    "supersedes": supersedes[]._ref,
    "contradicts": contradicts[]._ref,
    "supersededBy": *[_type == "claim" && ^._id in supersedes[]._ref]._id
  }
`;
