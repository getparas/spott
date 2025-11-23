import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users Table
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(), // clerk user id for auth
    email: v.string(),
    imageUrl: v.optional(v.string()),

    // OnBoarding
    hasCompletedOnBoarding: v.boolean(),

    location: v.optional(
      v.object({
        city: v.string(),
        state: v.string(),
        country: v.string(),
      }),
    ),

    interests: v.optional(v.array(v.string())), // Min 3 categories

    // Organizer tracking (User Subscription)
    freeEventsCreated: v.number(), // Track free event limit (1 free)

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),
});
