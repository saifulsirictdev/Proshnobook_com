export const englishFirstGrades = [6,7,8,9,10,11,12] as const;
export function englishAdminCategory(grade:number) { return grade<=8?`Class ${grade}`:grade<=10?"Class 9":"Class 11-12"; }
export function englishCategoryGrades(category:string) { return englishFirstGrades.filter(g=>englishAdminCategory(g)===category); }
export function englishAdminHref(grade:number, importing=false) {return `/admin/questions${importing?"/import":""}?category=${encodeURIComponent(englishAdminCategory(grade))}&subject=English%201st%20Paper&grade=${grade}${importing?"":"&status=pending"}#english-question-items`;}
export function englishAdminGrade(raw:unknown) {const n=Number(raw??6);return englishFirstGrades.includes(n as 6)?n:null;}
