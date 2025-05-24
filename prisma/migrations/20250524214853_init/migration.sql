-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "appId" INTEGER NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
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

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_appId_key" ON "Game"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_steamId_key" ON "Review"("steamId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
