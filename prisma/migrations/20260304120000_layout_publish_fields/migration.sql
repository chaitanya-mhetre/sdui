-- AlterTable: Add publish fields and REXA JSON to layouts
ALTER TABLE "layouts" ADD COLUMN "screenName" TEXT;
ALTER TABLE "layouts" ADD COLUMN "rexaJson" JSONB;
ALTER TABLE "layouts" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "layouts" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "layouts_isPublished_idx" ON "layouts"("isPublished");
CREATE INDEX "layouts_screenName_idx" ON "layouts"("screenName");
