"use server";
import { redirect } from "next/navigation";
import { admin } from "@/lib/guard";
// Retire unversioned hard-delete and filter-wide approval entrypoints. Existing
// open tabs must also pass through the reviewed, revision-checked workspace.
async function workspace(): Promise<never> { await admin(); redirect("/admin/questions/bank"); }
export async function toggleOne(_id: string, _back: string): Promise<void> { await workspace(); }
export async function deleteOne(_id: string, _back: string): Promise<void> { await workspace(); }
export async function approveMany(_back: string, _fd: FormData): Promise<void> { await workspace(); }
export async function deleteMany(_back: string, _fd: FormData): Promise<void> { await workspace(); }
