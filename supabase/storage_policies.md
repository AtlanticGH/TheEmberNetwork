## Storage setup (Supabase)

This project currently uploads to the Storage bucket **`public`** by default (see `src/services/mediaAssets.js` and `src/services/fileUploads.js`).

For a production-grade setup, create **two buckets**:

- `course-materials` (private): lesson files / assignment files
- `resources` (public): free downloads for `/resources`

Then add Storage policies:

- **Upload / delete only staff** (authenticated users whose `profiles.role` is staff/admin)
- **Read rules**
  - `course-materials`: read for **authenticated** users (or signed URLs only)
  - `resources`: public read

If you keep using the `public` bucket, ensure Storage policies still block anon uploads.

