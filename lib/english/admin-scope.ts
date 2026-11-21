import type { EnglishPaper } from "./blueprints";
export const englishFirstGrades = [6,7,8,9,10,11,12] as const;
/** SSC is the visible shared category; legacy catalog/storage aliases remain readable. */
export function englishCategoryLabel(category:string) { return ["SSC","Class 9","Class 10","Class 9-10","9","10","9-10"].includes(category) ? "SSC" : category; }
export function englishAdminCategory(grade:number) { return grade<=8?`Class ${grade}`:grade<=10?"SSC":"Class 11-12"; }
export function englishCategoryGrades(category:string) { return englishFirstGrades.filter(g=>englishAdminCategory(g)===englishCategoryLabel(category)); }
export function englishAdminHref(grade:number, importing=false, paper: EnglishPaper = 1) {return `/admin/questions${importing?"/import":""}?category=${encodeURIComponent(englishAdminCategory(grade))}&subject=${paper===1?"English%201st%20Paper":grade<=10?"English%20Grammar%20and%20Composition":"English%202nd%20Paper"}&grade=${grade}${importing?"":"&status=pending"}#english-question-items`;}
export function englishAdminGrade(raw:unknown) {const n=Number(raw??6);return englishFirstGrades.includes(n as 6)?n:null;}

export function englishAdminPaper(raw: unknown): EnglishPaper | null { return raw == null || raw === "" || raw === "1" || raw === 1 ? 1 : raw === "2" || raw === 2 ? 2 : null; }
