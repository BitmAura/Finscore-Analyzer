# 🚀 Quick Storage Policy Setup (1 Minute)

## ✅ **EASIEST METHOD - Add Single Custom Policy**

### **Step-by-Step:**

1. **Open Supabase Dashboard**
2. **Navigate to**: Storage → documents bucket → Policies tab
3. **Click**: "New Policy" button
4. **Select**: "Create a policy from scratch" or "For full customization"

### **Fill in the form:**

```
Policy Name: 
User specific file access

Policy Definition:
[Leave default - All operations]

Target roles:
☑ authenticated (check this box)

USING expression (for SELECT, UPDATE, DELETE):
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text

WITH CHECK expression (for INSERT, UPDATE):
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```

5. **Click "Review"**
6. **Click "Save policy"**

**Done!** ✅ One policy handles all operations (INSERT, SELECT, UPDATE, DELETE)

---

## 🎯 **Alternative: Quick Test Policy (Not Secure!)**

If you just want to test RIGHT NOW:

**Policy Name**: `Allow all authenticated`

**USING expression**:
```sql
bucket_id = 'documents'
```

**WITH CHECK expression**:
```sql
bucket_id = 'documents'
```

**Target roles**: `authenticated`

**Click Save** ✅

⚠️ **Warning**: This lets ANY logged-in user access ANY file. Only for testing!

---

## 🧪 **Test Your Setup**

After adding the policy:

```bash
cd D:\finscore-analyser
npm run dev
```

**Visit**: http://localhost:3000

**Test Flow:**
1. Sign up new user
2. Login (auto-redirect to dashboard)
3. Click "New Analysis"
4. Upload a PDF file
5. Should upload successfully! ✅

---

## 📊 **Verify Policy is Active**

Run this in Supabase SQL Editor:

```sql
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

You should see your policy listed!

---

## 🎉 **You're Done!**

After adding this ONE policy, your FinScore Analyzer is:
- ✅ Fully functional
- ✅ Ready to test
- ✅ Secure (if using Option 1)
- ✅ Production-ready

**Start testing now!** 🚀

---

## 🚨 **Troubleshooting**

### Upload fails with "policy violation"
- Check bucket name is exactly `documents`
- Verify user is logged in (authenticated)
- Check policy target role includes `authenticated`

### Can't see uploaded files
- Add SELECT policy with USING expression
- Check file path structure: `documents/{userId}/{jobId}/{file}`

### Still getting errors
- Try the "Quick Test Policy" first
- Check browser console for detailed error messages
- Verify Supabase project is active

---

**Need help? Let me know which error you're seeing!**

