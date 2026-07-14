import { defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list_products";
import searchProducts from "./tools/search_products";
import listCommunityPosts from "./tools/list_posts";

export default defineMcp({
  name: "deluxla-mcp",
  title: "Deluxla MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for the Deluxla marketplace. Use `list_products` or `search_products` to browse items for sale, and `list_community_posts` to read community discussions.",
  tools: [listProducts, searchProducts, listCommunityPosts],
});