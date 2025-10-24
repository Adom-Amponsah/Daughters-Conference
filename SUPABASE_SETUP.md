# 🚀 Supabase Integration Setup Guide

## ✅ What's Already Done

1. **✅ Supabase client installed** (`@supabase/supabase-js`)
2. **✅ Configuration files created**
3. **✅ Registration form integrated**
4. **✅ Error handling and loading states**

## 🔧 What You Need to Do

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `grm-womens-conference` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for the project to be ready (2-3 minutes)

### Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Update Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-actual-key
```

### Step 4: Create Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire content from `database/schema.sql`
3. Click **Run** to execute the SQL
4. This will create:
   - `conference_registrations` table
   - Proper indexes for performance
   - Row Level Security policies
   - Automatic timestamp updates

### Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Open the registration form
3. Fill out all steps and submit
4. Check your Supabase dashboard → **Table Editor** → `conference_registrations`
5. You should see your test registration data!

## 📊 Database Schema

The `conference_registrations` table includes:

- **Personal Info**: `full_name`, `email`, `phone_number`, `age`
- **Church Info**: `is_grm_member`, `grm_branch`, `church_name`
- **Exhibition**: `wants_to_exhibit`, `exhibition_description`
- **Metadata**: `id`, `created_at`, `updated_at`

## 🔒 Security Features

- **Row Level Security (RLS)** enabled
- **Email uniqueness** constraint
- **Data validation** constraints
- **Public registration** allowed
- **Private data viewing** (users can only see their own data)

## 🎯 Features Included

### ✅ Registration Form
- **Step-by-step validation**
- **Real-time error handling**
- **Loading states with spinner**
- **Success confirmation**
- **Duplicate email prevention**

### ✅ Error Handling
- **Network errors**
- **Validation errors**
- **Duplicate registration detection**
- **User-friendly error messages**

### ✅ Data Validation
- **Email format validation**
- **Required field validation**
- **Conditional field validation** (GRM branch vs Church name)
- **Exhibition description requirement** (if exhibiting)

## 🚨 Important Notes

1. **Never commit your `.env` file** - it's already in `.gitignore`
2. **Keep your Supabase keys secure**
3. **The anon key is safe for frontend use** - it has limited permissions
4. **Test thoroughly** before going live

## 🎉 You're Ready!

Once you complete these steps, your registration form will:
- ✅ Save data to Supabase
- ✅ Prevent duplicate registrations
- ✅ Show loading states
- ✅ Handle errors gracefully
- ✅ Provide success confirmation

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Ensure the database table was created successfully
4. Test your Supabase connection in the dashboard
