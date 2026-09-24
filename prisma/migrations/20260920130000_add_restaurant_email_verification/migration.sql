-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "ownerId" INTEGER,
ADD COLUMN "emailVerificationCodeHash" VARCHAR(255),
ADD COLUMN "emailVerificationExpiresAt" TIMESTAMP(3),
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
