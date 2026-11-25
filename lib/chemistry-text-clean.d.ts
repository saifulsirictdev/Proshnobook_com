export declare const TOKEN_MAP: Record<string, string>;
export declare function isChemistrySubject(subject?: string | null): boolean;
export declare function cleanChemistryText(input: string): string;
export declare function cleanChemistrySubQuestions<T>(sub: T): T;
export declare function cleanChemistryOptionsValue<T>(opts: T): T;
export declare function chemistryScenarioSignature(item: {
  text?: string | null;
  question?: string | null;
  stimulus?: string | null;
  options?: unknown;
}): string;
export declare function interleaveByChemistryScenario<T>(
  items: T[],
  getSig?: (item: T) => string,
): T[];
