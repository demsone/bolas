import { z } from "zod";

export const mediaMetadataSchema = z.object({
  altText: z.string().trim().max(300, "Keep alt text under 300 characters."),
  caption: z.string().trim().max(1000, "Keep the caption under 1,000 characters."),
});
