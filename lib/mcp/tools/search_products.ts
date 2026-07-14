import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_products",
  title: "Search products",
  description: "Search Deluxla products by keyword against title, team, or description.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Search keyword."),
    limit: z.number().int().min(1).max(50).default(20),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const like = `%${query.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id,title,team,size,condition,price,description,created_at")
      .or(`title.ilike.${like},team.ilike.${like},description.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { products: data ?? [] },
    };
  },
});