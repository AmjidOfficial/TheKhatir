import { readFileSync } from "node:fs";

const migrationPath = "supabase/migrations/20261011000000_saas_core_foundation.sql";
const sql = readFileSync(migrationPath, "utf8");
const errors = [];

function requireMatch(pattern, message) {
  if (!pattern.test(sql)) errors.push(message);
}

const tables = [
  "user_profiles", "tenants", "tenant_memberships", "properties", "projects",
  "leads", "lead_activities", "tasks", "events", "event_registrations",
  "ad_campaigns", "content_pages", "audit_logs",
];

requireMatch(/^begin;\s*/i, "Migration must start with BEGIN.");
requireMatch(/commit;\s*$/i, "Migration must end with COMMIT.");

for (const table of tables) {
  requireMatch(
    new RegExp("create table if not exists public\\." + table + "\\b", "i"),
    "Missing required table: " + table,
  );
  requireMatch(
    new RegExp("alter table public\\." + table + " enable row level security", "i"),
    "RLS is not explicitly enabled for: " + table,
  );
  requireMatch(
    new RegExp('create policy "[^"]+" on public\\.' + table + "\\b", "i"),
    "No explicit RLS policy found for: " + table,
  );
}

const relationshipTriggers = [
  ["validate_leads_tenant_relationships", "leads"],
  ["validate_tasks_tenant_relationships", "tasks"],
  ["validate_lead_activities_tenant_relationships", "lead_activities"],
  ["validate_event_registrations_tenant_relationships", "event_registrations"],
  ["validate_ad_campaigns_tenant_relationships", "ad_campaigns"],
];

for (const [trigger, table] of relationshipTriggers) {
  requireMatch(
    new RegExp("create trigger " + trigger + "[\\s\\S]{0,180}?on public\\." + table, "i"),
    "Missing tenant relationship trigger " + trigger + " on " + table,
  );
}

for (const helper of [
  "is_platform_admin()", "is_tenant_member\\(uuid\\)",
  "can_manage_tenant\\(uuid\\)", "can_manage_listings\\(uuid\\)",
]) {
  requireMatch(
    new RegExp("grant execute on function public\\." + helper + " to authenticated;", "i"),
    "Authorization helper must be executable by authenticated users: " + helper,
  );
  if (new RegExp("grant execute on function public\\." + helper + " to anon", "i").test(sql)) {
    errors.push("Authorization helper must not be executable by anon: " + helper);
  }
}

requireMatch(
  /revoke all on public\.tenants, public\.properties, public\.projects, public\.events,[\s\S]{0,160}?from anon/i,
  "Anonymous users must not receive base-table access to tenant data.",
);
requireMatch(
  /grant select on public\.marketplace_businesses,[\s\S]{0,260}?to anon, authenticated/i,
  "Curated public marketplace views must be explicitly granted.",
);

const functionBlocks = sql
  .split(/(?=create or replace function public\.)/i)
  .filter((block) => /^create or replace function public\./i.test(block));

for (const block of functionBlocks) {
  if (/security definer/i.test(block) && !/set search_path = public/i.test(block)) {
    errors.push(
      "SECURITY DEFINER function lacks a fixed search_path near: " +
      block.slice(0, 100).replace(/\s+/g, " "),
    );
  }
}

if (errors.length) {
  console.error("SaaS migration static validation failed:");
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  console.log("SaaS migration static validation passed (" + tables.length + " required tables, RLS, policies, relationship triggers, helper grants, and curated-view grants).");
  console.log("Note: this is a static guard only; it does not execute SQL or prove live RLS isolation.");
}
