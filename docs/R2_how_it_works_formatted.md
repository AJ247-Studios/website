# R2 Storage Implementation Guide

## Step 1: Define the Features

You should document this structure in your README or implementation docs.

### Storage Features We Support

#### 1. User Profile Media

- Profile picture
- Banner image

**Storage Path:**
```
users/{userId}/profile/avatar.jpg
users/{userId}/profile/banner.jpg
```

#### 2. Portfolio Media (Public)

Images visible on the website.

**Storage Path:**
```
portfolio/{projectId}/{uuid}.jpg
```

**Visibility:** Public (but still served via signed URLs)

#### 3. Client Delivery Media (Private)

Only visible to the associated client.

**Storage Path:**
```
clients/{clientId}/deliverables/{uuid}.jpg
```

**Visibility:** Private

> This structure is clean, scalable, and future-proof.

---

## Step 2: What the Worker Will Do

Your Worker has exactly **two responsibilities**:

### A. Upload URLs

**Endpoint:** `POST /api/upload-url`

**Worker Process:**
1. Reads Supabase JWT
2. Confirms user identity
3. Confirms they're allowed to upload to that key
4. Generates presigned PUT URL for R2
5. Returns `{ url, key }`

**Frontend Process:**
- Uploads file directly to R2
- Worker never sees the file

### B. Download URLs

**Endpoint:** `GET /api/download-url?key=...`

**Worker Process:**
1. Reads Supabase JWT
2. Confirms ownership or public visibility
3. Generates presigned GET URL
4. Returns URL

**Frontend Process:**
- Uses URL in `<img>` or download

---

## Step 3: Implementation Steps

Follow these steps **in order**:

### 1️⃣ Stop Touching Zero Trust / Access

- You don't need it
- It is not part of this system

### 2️⃣ Lock the Worker URL

Confirm this is your base URL:
```
https://aj247-gatekeeper.aj247studios.workers.dev
```

### 3️⃣ Test the Worker Connection

In Postman, test ONLY this:
```http
GET https://aj247-gatekeeper.aj247studios.workers.dev/health
```

(or any simple test route you have)

✅ If it returns JSON → backend is solid

### 4️⃣ Move to R2 Bucket Creation

That is the next real integration step.
