import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_community_posts",
  title: "List community posts",
  description: "List recent deluxla community posts, most recent first.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(20)
      .describe("Max posts to return (1-50)."),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: async ({ limit }) => {
    const { posts, artistByKey } = await import("@/lib/mock-data");
    const data = [...posts]
      .sort((a, b) => a.createdMinutes - b.createdMinutes)
      .slice(0, limit)
      .map((post) => ({
        id: post.id,
        title: post.title,
        artist: artistByKey[post.artist].name,
        category: post.category,
        excerpt: post.excerpt,
        likes: post.likes,
        comments: post.comments,
        created: post.createdLabel,
      }));

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { posts: data },
    };
  },
});
