import { defineMcp } from "@lovable.dev/mcp-js";
import listCommunityPosts from "./tools/list_posts";

export default defineMcp({
  name: "pulseroom-mcp",
  title: "pulseroom MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for the pulseroom fan community. Use `list_community_posts` to read the community feed. The data is front-end mock content while the backend is being built.",
  tools: [listCommunityPosts],
});
