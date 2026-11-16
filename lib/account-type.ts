export const ACCOUNT_TYPE_PREFIX = "account-type:v1:";
export const ACCOUNT_TYPES = ["TEACHER", "STUDENT", "CONTRIBUTOR"] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];
export function accountType(value: unknown): AccountType | null {
  return ACCOUNT_TYPES.includes(value as AccountType) ? value as AccountType : null;
}
export function accountDestination(type: AccountType) {
  return type === "STUDENT" ? "/model-test" : "/dashboard";
}
/** Contributor is a distinct identity with existing teacher capabilities, never Admin. */
export function capabilityRole(type: AccountType): "TEACHER" | "STUDENT" {
  return type === "STUDENT" ? "STUDENT" : "TEACHER";
}
