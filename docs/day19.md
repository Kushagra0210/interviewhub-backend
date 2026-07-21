##Q1. What is MongoDB?
### Answer
MongoDB is a **NoSQL document database** that stores data in the form of **BSON (Binary JSON) documents** instead of rows and columns.
Example
```json
{
   "name":"Google",
   "website":"https://google.com"
}
```
---
## Q2. What is Mongoose?

### Answer
Mongoose is an **ODM (Object Data Modeling)** library for Node.js.
It sits between
```text
Node.js
↓
Mongoose
↓
MongoDB
```
and provides
* Schema
* Validation
* Middleware
* Model methods
* Population
* Cleaner Queries
---
## Q3. What is Schema?
### Answer
A Schema is a blueprint of a MongoDB document.
It defines
* Fields
* Data Types
* Validation Rules
* Default Values
Example
```js
const companySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
});
```
---

## Q4. Why do we need Schema?
### Answer
Without Schema
MongoDB allows

```json
{
"name":"Google"
}
```
and

```json
{
"salary":100000
}
```
inside same collection.
Schema keeps every document consistent.
---
## Q5. What is Validation?
### Answer
Validation ensures incoming data satisfies predefined rules before saving.
Example
```js
required:true
```
means field cannot be empty.
---
## Q6. What is CRUD?
### Answer
CRUD stands for
* Create
* Read
* Update
* Delete
These are the four basic database operations.
---
## Q7. What is Collection?
### Answer
A Collection is a group of related documents.
Equivalent to
SQL Table.
Example
```text
Users
Companies
Questions
```
---
## Q8. What is Document?
### Answer
A Document is a single record inside a collection.
Example
```json
{
"name":"Google"
}
```
---
# Medium Interview Questions
---
## Q9. Why use Mongoose instead of MongoDB Driver?
### Answer
MongoDB Driver only communicates with MongoDB.
Mongoose additionally provides
* Schema
* Validation
* Middleware
* Cleaner Code
* Population
* Plugins
Hence Mongoose is preferred in production.

---

## Q10. Why create a separate Company Collection?
### Answer
To avoid data duplication.
Instead of
```text
Question
↓
Google
Google
Google
Google
```
Store
```text
Company
↓
Google
```
and Questions reference it.
---
## Q11. What is Normalization?
### Answer
Normalization is organizing data to reduce redundancy by storing information only once.
Benefits
* Less duplication
* Easier updates
* Better consistency
---
## Q12. Why store Logo URL instead of Image?
### Answer
Cloudinary stores images.
MongoDB stores only
```text
https://....
```
Benefits
* Faster database
* Less storage
* Better CDN support
---
## Q13. What is Slug?
### Answer
Slug is a URL-friendly version of a string.
Example
```text
Google
↓
google
```
URL
```text
/company/google
```
instead of
```text
/687657654
```
---
## Q14. Why timestamps?
### Answer
Automatically generates
```text
createdAt
updatedAt
```
Useful for
* Analytics
* Admin Panel
* Sorting
* Audit
---
# Advanced Interview Questions
---
## Q15. Why not store Company Name inside every Question?
### Answer
Suppose
Google changes logo.
If every Question stores Google data
Need to update
1000 Questions.
If Company Collection exists
Only
1 Document updates.
---

## Q16. Why should backend generate Slug?

### Answer

Because client cannot be trusted.

Client may send

```text
GOOGLE

Google123

Google###
```

Backend should always generate consistent slug.

---

## Q17. Why MVC?

### Answer

MVC separates responsibilities.

```text
Route

↓

Controller

↓

Model

↓

Database
```

Benefits

* Cleaner code
* Easier testing
* Reusable Controllers
* Better scalability

---

## Q18. Why Controllers?

### Answer

Routes should only decide

WHICH controller runs.

Business logic belongs inside Controller.

---

## Q19. Why Models?

### Answer

Models communicate with MongoDB.

Controllers should never directly manipulate database collections.

---

## Q20. Explain REST APIs.

### Answer

REST maps HTTP methods to operations.

```text
GET

↓

Read
```

```text
POST

↓

Create
```

```text
PUT

↓

Update
```

```text
DELETE

↓

Delete
```

---

# Counter Questions (With Solutions)

---

## Q1

Why can't MongoDB enforce structure?

### Solution

MongoDB is schema-less by design.

It accepts any document.

Mongoose introduces Schema to enforce

* Validation
* Consistency
* Type Safety

---

## Q2

Why not store

```text
Company Name
```

inside Question?

### Solution

Because

* Duplicate Data
* Difficult Updates
* Wasted Storage
* Inconsistent Records

---

## Q3

Why create Company Collection first instead of Question Collection?

### Solution

Questions depend on Company.

Parent collection should exist first.

Later Questions will reference Company IDs.

---

## Q4

Why use ObjectId instead of Company Name?

### Solution

ObjectId

* Never changes
* Faster indexing
* Better relationships

Company names can change.

---

## Q5

Why is

```js
trim:true
```

important?

### Solution

Without trim

```text
Google

Google____
```

become two different strings.

Trim removes unnecessary spaces.

---

## Q6

Why lowercase slug?

### Solution

Without lowercase

```text
Google

google

GOOGLE
```

become different URLs.

---

## Q7

Why use

```js
required:true
```

instead of checking manually?

### Solution

Validation belongs in Schema.

Every insertion automatically follows rules.

---

## Q8

Why not create image field as Buffer?

### Solution

MongoDB isn't optimized for serving media.

Use

Cloudinary

AWS S3

Firebase Storage

---

## Q9

Why Feature Branch?

### Solution

Allows

* Independent development
* Safe rollback
* Code Review
* Parallel development

---

## Q10

Why use

```js
Company.find()
```

instead of raw MongoDB queries?

### Solution

Mongoose Models provide

* Validation
* Middleware
* Cleaner syntax
* Better maintainability

---

# Tricky Questions (With Solutions)

---

## Q1

Does

```js
unique:true
```

validate uniqueness?

### Solution

No.

It creates a unique index.

Duplicate insertions can still occur concurrently, so your code should handle duplicate key errors.

---

## Q2

Can MongoDB work without Mongoose?

### Solution

Yes.

Mongoose is optional.

MongoDB Driver communicates directly with MongoDB.

---

## Q3

Can we change Schema later?

### Solution

Yes.

New fields can be added anytime.

Old documents simply won't have those fields until updated.

---

## Q4

Can one Question belong to multiple Companies?

### Solution

Yes.

```text
Google

Amazon

Microsoft

↓

Question
```

Question Schema

```js
companies:[
ObjectId,
ObjectId,
ObjectId
]
```

Many-to-Many Relationship.

---

## Q5

Can one Company have multiple Questions?

### Solution

Yes.

One Company

↓

Many Questions

---

## Q6

What happens if Company is deleted?

### Solution

Questions still reference its ObjectId.

This creates orphan references.

Later we'll solve this using:

* Cascade Delete
* Soft Delete
* Validation checks

---

# Common Mistakes (With Fixes)

### Mistake

```js
req.status()
```

### Fix

```js
res.status()
```

---

### Mistake

Using

```js
createCompany()
```

inside PUT.

### Fix

Use

```js
updateCompany()
```

---

### Mistake

Import after use.

### Fix

Always import first.

---

### Mistake

Using

```js
user.findById()
```

### Fix

```js
User.findById()
```

---

### Mistake

Returning

```text
200 OK
```

inside catch.

### Fix

Return

```text
500 Internal Server Error
```

---

### Mistake

Trusting client-generated slug.

### Fix

Generate slug in backend.

---

# Flashcards

**Q:** Why Mongoose?
**A:** Schema, validation, middleware, cleaner queries.

**Q:** Why Schema?
**A:** Consistent document structure.

**Q:** Why Company Collection?
**A:** Avoid duplication.

**Q:** Why Slug?
**A:** Readable URLs.

**Q:** Why MVC?
**A:** Separation of concerns.

**Q:** Why Cloudinary?
**A:** Efficient image storage.

**Q:** Why Feature Branch?
**A:** Parallel and safe development.

**Q:** Why ObjectId?
**A:** Stable references and efficient relationships.

---

# ⭐ FAANG Interview Bonus Questions

These are the kinds of follow-up questions an interviewer may ask after Day 19.

### Q1. If the company name changes from **Facebook** to **Meta**, what changes in your database?

**Answer:** Only the Company document is updated. All related Questions continue referencing the same `ObjectId`, so no Question documents need modification.

---

### Q2. Why don't we use the company name as the foreign key?

**Answer:** Names can change, have spelling differences, or casing issues. `ObjectId` is immutable, indexed, and designed for relationships.

---

### Q3. How would you prevent duplicate companies such as **Google**, **google**, and ** GOOGLE **?

**Answer:** Use `trim: true`, `lowercase: true` (or normalize input), a unique index, and validate duplicate key (`E11000`) errors in the controller.

---

### Q4. Suppose InterviewHub grows to **50 million questions**. Would your database design still scale?

**Answer:** Yes. Since company information is normalized into its own collection and Questions store only references (`ObjectId`s), updates remain efficient and duplication is avoided. Additional optimizations like indexes, pagination, caching, and sharding can be added as the application grows.

This format is exactly what interviewers expect: **definition → reasoning → trade-offs → real-world application**. If you maintain notes like this for every day, you'll build a backend interview handbook rather than just a collection of syntax notes.
