-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analysis_sessionId_idx" ON "Analysis"("sessionId");
