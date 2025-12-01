-- Migration: create AiFeedback table for AI persistence
CREATE TABLE IF NOT EXISTS "AiFeedback" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "submissionId" TEXT NOT NULL UNIQUE,
  "prompt" TEXT NOT NULL,
  "response" TEXT NOT NULL,
  "source" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
