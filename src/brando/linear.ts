// Helpers for keeping Motion tasks linked to Linear issues. The MCP itself
// never calls Linear — it just embeds a discoverable BRA-XXX reference and
// URL into the Motion task description so both surfaces stay in sync.

const LINEAR_TEAM_PREFIX = 'BRA';
const LINEAR_BASE_URL = 'https://linear.app/brandono/issue';

export function extractLinearId(text?: string | null): string | null {
  if (!text) return null;
  const match = text.match(/\bBRA-\d+\b/);
  return match ? match[0] : null;
}

export function linearUrl(linearId: string): string {
  return `${LINEAR_BASE_URL}/${linearId.toUpperCase()}`;
}

export function isValidLinearId(id: string): boolean {
  return new RegExp(`^${LINEAR_TEAM_PREFIX}-\\d+$`, 'i').test(id.trim());
}

// Appends a Linear reference block to a description if not already present.
export function withLinearReference(description: string | undefined, linearId: string): string {
  const url = linearUrl(linearId);
  const block = `\n\n---\n**Linear:** [${linearId.toUpperCase()}](${url})`;
  if (description?.includes(linearId)) return description;
  return (description ?? '') + block;
}
