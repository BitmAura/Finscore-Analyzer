# 🔐 Storage Policies Setup Guide

## ❌ Why SQL Didn't Work

The error `must be owner of table objects` occurs because `storage.objects` is owned by Supabase's system user, not your project user. You cannot modify it via SQL.

## ✅ **CORRECT METHOD: Use Supabase Dashboard UI**

### **Step 1: Navigate to Storage Policies**

1. Open **Supabase Dashboard**
2. Click **"Storage"** in left sidebar
3. Click your **"documents"** bucket
4. Click **"Policies"** tab at the top

### **Step 2: Add 4 Storage Policies**

Click **"New Policy"** button and create each policy:

---

#### **Policy 1: Upload Files**

```
Policy Name: Users can upload own documents
Allowed operation: INSERT
Target roles: authenticated
WITH CHECK expression:
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Click "Save"**

---

#### **Policy 2: View Files**

```
Policy Name: Users can view own documents
Allowed operation: SELECT
Target roles: authenticated
USING expression:
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Click "Save"**

---

#### **Policy 3: Update Files**

```
Policy Name: Users can update own documents
Allowed operation: UPDATE
Target roles: authenticated
USING expression:
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
WITH CHECK expression:
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Click "Save"**

---

#### **Policy 4: Delete Files**

```
Policy Name: Users can delete own documents
Allowed operation: DELETE
Target roles: authenticated
USING expression:
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Click "Save"**

---

## 🎯 **How These Policies Work**

### **Policy Logic:**
```
(storage.foldername(name))[1] = auth.uid()::text
```

This ensures:
- Files are organized as: `documents/{userId}/{jobId}/{filename}`
- Users can only access files in their own folder
- The first folder name must match their user ID

### **File Structure:**
```
documents/
├── abc123-user1/          ← User 1's folder
│   ├── job-001/
│   │   └── statement.pdf
│   └── job-002/
│       └── invoice.pdf
└── xyz789-user2/          ← User 2's folder
    └── job-003/
        └── report.pdf
```

---

## ⚡ **QUICK TEST OPTION (For Testing Only!)**

If you just want to test file uploads quickly:

### **Option 1: Make Bucket Public**
1. Storage → documents bucket
2. Click "Edit bucket"
3. Toggle "Public bucket" → **ON**
4. Click "Save"

**⚠️ WARNING**: All files become publicly accessible! Only for testing. Turn OFF before production.

---

### **Option 2: Allow All Authenticated Users**

Create a simple policy:
```
Policy Name: Allow authenticated uploads
Operation: INSERT, SELECT, UPDATE, DELETE
Target: authenticated
Expression: bucket_id = 'documents'
```

This lets all logged-in users upload/view/delete any file in the bucket. **Not recommended for production!**

---

## ✅ **Verify Policies Are Working**

After adding policies, run this SQL to verify:

```sql
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;
```

You should see 4 policies listed.

---

## 🧪 **Test File Upload**

1. Start your app: `npm run dev`
2. Visit: http://localhost:3000
3. Sign up → Login
4. Click "New Analysis"
5. Try uploading a PDF
6. **Should work now!** ✅

---

## 🚨 **Troubleshooting**

### "Storage policy error" or "Insufficient permissions"
**Solution**: 
- Check policies are created for ALL operations (INSERT, SELECT, UPDATE, DELETE)
- Verify bucket name is exactly "documents"
- Check you're logged in as authenticated user

### Files upload but can't view them
**Solution**:
- Add SELECT policy with USING expression
- Check file paths include user ID as first folder

### "Bucket not found"
**Solution**:
- Verify bucket is named "documents" (lowercase, no spaces)
- Check bucket exists in Storage section

---

## 📝 **Summary**

✅ **What to do:**
1. Go to Supabase Dashboard → Storage → documents → Policies
2. Create 4 policies (one for each operation)
3. Use the expressions provided above
4. Test file upload in your app

❌ **Don't do:**
- Don't try to run SQL ALTER TABLE on storage.objects
- Don't make bucket public in production
- Don't skip the SELECT policy (users won't see their files!)

---

## 🎉 **After Adding Policies**

Your FinScore Analyzer will be **100% functional**:
- ✅ User authentication
- ✅ Database tables
- ✅ File upload & storage
- ✅ Analysis job tracking
- ✅ Dashboard with real data

**You're ready to start testing!** 🚀

---

*Need help? Just let me know which step you're stuck on.*

