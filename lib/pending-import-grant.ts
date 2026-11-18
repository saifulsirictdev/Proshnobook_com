import {createHash,timingSafeEqual} from "node:crypto";

type Grant={id:string;issuedAt:string;expiresAt:string;tokenSha256:string;batches:Record<string,string>};
// A separate, revocable capability. Never accepts Google credentials or ADMIN cookies.
export function authorizePendingImport(header:string|null,raw:string|undefined,now=Date.now()):Grant{
 if(!raw||!header||!/^Bearer [A-Za-z0-9_-]{43,128}$/.test(header))throw Error("Unauthorized");
 const g=JSON.parse(raw) as Grant;
 if(!g||!/^[-a-zA-Z0-9_]{8,80}$/.test(g.id)||!/^\d{4}-/.test(g.issuedAt)||!/^\d{4}-/.test(g.expiresAt))throw Error("Unauthorized");
 const issued=Date.parse(g.issuedAt),expires=Date.parse(g.expiresAt);
 if(!Number.isFinite(issued)||!Number.isFinite(expires)||issued>now||expires<=now||expires<=issued||expires-issued>86400000)throw Error("Unauthorized");
 if(typeof g.tokenSha256!=="string"||!/^[a-f0-9]{64}$/.test(g.tokenSha256)||!g.batches||Array.isArray(g.batches)||typeof g.batches!=="object")throw Error("Unauthorized");
 const entries=Object.entries(g.batches);
 if(entries.length<1||entries.length>40||entries.some(([id,d])=>!/^[-a-zA-Z0-9_]{1,100}$/.test(id)||typeof d!=="string"||!/^[a-f0-9]{64}$/.test(d)))throw Error("Unauthorized");
 const candidate=createHash("sha256").update(header.slice(7)).digest();
 if(!timingSafeEqual(candidate,Buffer.from(g.tokenSha256,"hex")))throw Error("Unauthorized");
 return g;
}
export function assertGrantedBatch(grant:Grant,id:string,digest:string){
 if(!Object.hasOwn(grant.batches,id)||grant.batches[id]!==digest)throw Error("Not granted");
}
