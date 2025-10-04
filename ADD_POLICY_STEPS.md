# 🎯 Add Storage Policy - Exact Steps From Your Screen

## What I See in Your Screenshot:

✅ Storage Policies page is open  
✅ DOCUMENTS bucket exists  
✅ "No policies created yet" under DOCUMENTS  
⚠️ You need to click **"New policy"** button next to DOCUMENTS

---

## 📝 STEP-BY-STEP INSTRUCTIONS:

### **Step 1: Click "New policy" Button**
- Look at the **DOCUMENTS** section (first section)
- On the right side, you'll see a **"New policy"** button
- **Click it**

### **Step 2: Choose Policy Template**
You'll see options like:
- "Allow all operations"
- "Allow SELECT for authenticated users"
- "Custom policy"

**Choose**: **"For full customization"** or **"Custom policy"**

### **Step 3: Fill in Policy Details**

**Policy Name:**
```
allow_user_uploads
```

**Allowed operation:** Select **ALL** (or check all boxes: SELECT, INSERT, UPDATE, DELETE)

**Target roles:** Check **☑ authenticated**

**Policy definition (USING):**
```sql
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```

**WITH CHECK expression:**
```sql
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```

### **Step 4: Click "Review"**
- Review your policy
- Click **"Save policy"**

**Done!** ✅

---

## 🚀 SUPER SIMPLE ALTERNATIVE (Quick Test):

If the above seems complicated, try this SIMPLER policy:

### **After clicking "New policy":**

1. **Policy Name**: `test_upload_policy`
2. **Allowed operation**: Check **ALL** boxes
3. **Target roles**: ☑ **authenticated**
4. **USING expression**:
```sql
bucket_id = 'documents'
```
5. **WITH CHECK expression**:
```sql
bucket_id = 'documents'
```
6. **Click "Save policy"**

⚠️ **Note**: This allows all authenticated users to access any file. Use only for testing!

---

## 🔍 What You Should See After:

Under **DOCUMENTS** section, instead of "No policies created yet", you'll see:
- Policy name
- Command (ALL or specific operations)
- Applied to (authenticated)

---

## 🧪 Test Immediately After Adding Policy:

```bash
cd D:\finscore-analyser
npm run dev
```

Then:
1. Go to http://localhost:3000
2. Sign up / Login
3. Click "New Analysis"
4. Upload a PDF file
5. **Should work without errors!** ✅

---

## ❓ If You Don't See "New policy" Button:

- Make sure you're looking at the **DOCUMENTS** section (top section)
- Scroll right if needed
- The button is on the same line as "DOCUMENTS"

---

## 🎯 Expected Result:

After adding the policy, your DOCUMENTS section will change from:
```
DOCUMENTS
No policies created yet
```

To:
```
DOCUMENTS
[Policy Name]     [COMMAND]     [APPLIED TO]
allow_user_uploads    ALL      authenticated
```

---

**Click "New policy" next to DOCUMENTS and follow the steps above!** 🚀

Need help with a specific step? Let me know which part is confusing!

