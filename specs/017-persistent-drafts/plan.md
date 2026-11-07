# Plan

Use MongoDB driver with publisher-owned drafts and preparations, unique IDs, owner/date list index and optimistic draft version. Retain process-local active execution only. Persist before paid work and after each activity. Interrupted jobs become failed on startup with draft retained; never replay paid work. Add typed save/get/list tools and stable draft query links. Existing receipts stay on their volume. Update former no-Mongo architecture constraints as explicitly authorized by user. No legacy migration/cutover: no live users.
