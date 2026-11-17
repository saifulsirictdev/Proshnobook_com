// Browser-safe selection helpers. Saving still resolves a trusted batch server-side.
export type PreparedScope={category:string;subject:string;topic:string};
export function selectPreparedBatches<T extends PreparedScope>(batches:T[],selection:PreparedScope):T[]{
 if(!selection.category||!selection.subject)return [];
 return batches.filter(b=>b.category===selection.category&&b.subject===selection.subject&&(!selection.topic||b.topic===selection.topic));
}
export function pendingReviewHref(category:string,subject:string){
 return `/admin/questions?${new URLSearchParams({category,subject,status:"pending"}).toString()}`;
}
