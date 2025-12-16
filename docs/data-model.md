# Data Model (Database Agnostic)

This document defines the **Logical Data Model** for the Vwaza Release Manager.
It describes the *Entities*, their *Attributes*, and their *Relationships* in plain English, independent of any specific database technology (SQL, NoSQL, etc.).

---

## 1. User
**Represents:** A person interacting with the system.
**Role:** Can be an **Artist** (uploader) or an **Admin** (reviewer).

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **ID** | Unique Identifier | Yes | Unique key for the user. |
| **Email** | String (Email) | Yes | Unique login credential. |
| **Password** | String (Hash) | Yes | Securely hashed password. |
| **Role** | Enum | Yes | Either `ARTIST` or `ADMIN`. |
| **Artist Name** | String | No | The public name of the artist (Required if Role is ARTIST). |

---

## 2. Release
**Represents:** A collection of music (Album, EP, or Single) created by an Artist.
**Parent:** Belongs to one **User** (Artist).

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **ID** | Unique Identifier | Yes | Unique key for the release. |
| **Artist ID** | Reference | Yes | Link to the **User** who owns this. |
| **Title** | String | Yes | The name of the album/EP. |
| **Genre** | String | Yes | The musical genre (e.g., "Hip Hop"). |
| **Cover Art** | URL / String | No | Link to the image file. (Required before publishing). |
| **Status** | Enum | Yes | The current state of the release. |

### Status Lifecycle
1.  **DRAFT**: Artist is still working on it.
2.  **PROCESSING**: Files are being analyzed/transcoded.
3.  **PENDING_REVIEW**: Ready for Admin to check.
4.  **PUBLISHED**: Live and approved.
5.  **REJECTED**: Denied by Admin.

---

## 3. Track
**Represents:** A single song or audio file.
**Parent:** Belongs to one **Release**.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **ID** | Unique Identifier | Yes | Unique key for the track. |
| **Release ID** | Reference | Yes | Link to the **Release** this song belongs to. |
| **Title** | String | Yes | The name of the song. |
| **Audio File** | URL / String | Yes | Link to the actual music file. |
| **Duration** | Number | Yes | Length of the song in seconds. |
| **Order** | Number | Yes | The track number (1, 2, 3...) on the album. |
| **ISRC** | String | No | International Standard Recording Code (Optional). |

---

## 4. Password Reset Token
**Represents:** A temporary key allowing a user to change their password.
**Parent:** Belongs to one **User**.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **Token** | String (Hash) | Yes | The secret code sent to email. |
| **User ID** | Reference | Yes | Link to the **User**. |
| **Expires At** | Timestamp | Yes | When this token becomes invalid (e.g., 1 hour). |
| **Used** | Boolean | Yes | Prevents replay attacks (using the same token twice). |

---

## 5. Upload Job (The "Robustness" Layer)
**Represents:** A file waiting to be safely moved from our server to the Cloud.
**Purpose:** Ensures that if the Cloud is down, we don't lose the user's upload.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **ID** | Unique Identifier | Yes | Unique key for the job. |
| **Target Entity ID** | Reference | Yes | The ID of the **Track** or **Release** this file belongs to. |
| **Type** | Enum | Yes | `AUDIO` or `COVER_ART`. |
| **Local Path** | String | Yes | Where the file is temporarily stored on our disk (e.g., `/tmp/uploads/123.mp3`). |
| **Status** | Enum | Yes | `PENDING`, `UPLOADING`, `COMPLETED`, `FAILED`. |
| **Retry Count** | Number | Yes | How many times we have tried to upload. |
| **Error Log** | String | No | Why it failed (for debugging). |

---

## Relationships (The "Map")

1.  **User (Artist) $\rightarrow$ Releases**
    *   *Type:* **One-to-Many**
    *   *Meaning:* One Artist can create many Releases. A Release belongs to exactly one Artist.

2.  **Release $\rightarrow$ Tracks**
    *   *Type:* **One-to-Many**
    *   *Meaning:* One Release contains many Tracks. A Track belongs to exactly one Release.

3.  **User $\rightarrow$ Password Reset Tokens**
    *   *Type:* **One-to-Many**
    *   *Meaning:* A user can request multiple resets over time.

---

## Integrity Rules (Business Logic)

These rules must be enforced by the system, regardless of the database used:

1.  **Orphans**: If a **User** is deleted, all their **Releases**, **Tracks**, and **Tokens** must also be deleted.
2.  **Uniqueness**: A **User** cannot have two accounts with the same **Email**.
3.  **Ordering**: A **Release** cannot have two tracks with the same **Order** number (e.g., two "Track 1"s).
4.  **Completeness**: A **Release** cannot be moved to `PENDING_REVIEW` status unless it has at least one **Track** and a **Cover Art** image.

---

## The "Robust Upload" Strategy

You asked: *"If cloud uploads fail, do we lose the file?"*
**Answer: No.** We use the **Upload Job** entity to prevent this.

### The Flow
1.  **Receive**: User uploads file $\rightarrow$ We save it to **Local Disk** (Temporary).
2.  **Record**: We create an **Upload Job** in the DB (`Status: PENDING`, `Local Path: /tmp/...`).
3.  **Respond**: We tell the User "Upload Received" immediately. They don't wait for S3.
4.  **Process (Background)**:
    *   A background worker sees the `PENDING` job.
    *   It tries to upload to Cloud Storage (Supabase Storage).
    *   **Success**: It updates the **Track** with the new Cloud URL, deletes the local file, and marks Job as `COMPLETED`.
    *   **Failure**: It marks Job as `FAILED` (or increments retry). The local file stays safe. We retry later.

### Fetching Data
*   **Database**: Stores the **Metadata** (Title, Duration) and the **Cloud URL** (e.g., `https://your-project.supabase.co/storage/v1/object/public/vwaza-uploads/audio/...`).
*   **Cloud Storage**: Stores the actual **Bytes** (The MP3 file) in Supabase Storage buckets.
*   **Frontend**: Asks DB for the URL $\rightarrow$ Uses URL to play the song.
