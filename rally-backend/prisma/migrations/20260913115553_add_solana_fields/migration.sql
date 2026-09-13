/*
  Warnings:

  - A unique constraint covering the columns `[solanaActivityId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityPda]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[participantPda]` on the table `ActivityParticipant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "activityPda" TEXT,
ADD COLUMN     "solanaActivityId" TEXT,
ADD COLUMN     "txSignature" TEXT;

-- AlterTable
ALTER TABLE "ActivityParticipant" ADD COLUMN     "joinTxSignature" TEXT,
ADD COLUMN     "participantPda" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Activity_solanaActivityId_key" ON "Activity"("solanaActivityId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_activityPda_key" ON "Activity"("activityPda");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityParticipant_participantPda_key" ON "ActivityParticipant"("participantPda");
