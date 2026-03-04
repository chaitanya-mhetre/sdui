-- CreateTable: layout_versions (immutable publish snapshots)
CREATE TABLE "layout_versions" (
    "id"          TEXT NOT NULL,
    "layoutId"    TEXT NOT NULL,
    "projectId"   TEXT NOT NULL,
    "screenName"  TEXT,
    "version"     INTEGER NOT NULL,
    "rexaJson"    JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedBy" TEXT,
    "isActive"    BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "layout_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "layout_versions_layoutId_idx"   ON "layout_versions"("layoutId");
CREATE INDEX "layout_versions_projectId_idx"  ON "layout_versions"("projectId");
CREATE INDEX "layout_versions_screenName_idx" ON "layout_versions"("screenName");
CREATE INDEX "layout_versions_isActive_idx"   ON "layout_versions"("isActive");
CREATE INDEX "layout_versions_version_idx"    ON "layout_versions"("version");

-- AddForeignKey
ALTER TABLE "layout_versions" ADD CONSTRAINT "layout_versions_layoutId_fkey"
    FOREIGN KEY ("layoutId") REFERENCES "layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "layout_versions" ADD CONSTRAINT "layout_versions_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
