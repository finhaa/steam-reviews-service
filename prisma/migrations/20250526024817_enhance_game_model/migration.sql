/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_gameId_fkey";

-- DropTable
DROP TABLE "Game";

-- DropTable
DROP TABLE "Review";

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "app_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "short_description" TEXT NOT NULL DEFAULT '',
    "header_image" TEXT NOT NULL DEFAULT '',
    "website" TEXT,
    "developers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publishers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "required_age" INTEGER NOT NULL DEFAULT 0,
    "metacritic_score" INTEGER,
    "metacritic_url" TEXT,
    "release_date" TIMESTAMP(3),
    "platforms" JSONB NOT NULL DEFAULT '{"windows": false, "mac": false, "linux": false}',
    "categories" JSONB NOT NULL DEFAULT '[]',
    "genres" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "steamId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "authorSteamId" TEXT,
    "recommended" BOOLEAN NOT NULL,
    "content" TEXT NOT NULL,
    "timestampCreated" TIMESTAMP(3) NOT NULL,
    "timestampUpdated" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_app_id_key" ON "games"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_steamId_key" ON "reviews"("steamId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
