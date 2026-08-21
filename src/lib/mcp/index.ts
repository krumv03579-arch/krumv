import { defineMcp } from "@lovable.dev/mcp-js";
import listCommunityPosts from "./tools/list_posts";

export default defineMcp({
  name: "deluxla-mcp",
  title: "deluxla MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for the deluxla fan community. Use `list_community_posts` to read the community feed. The data is front-end mock content while the backend is being built.",
  tools: [listCommunityPosts],
});
