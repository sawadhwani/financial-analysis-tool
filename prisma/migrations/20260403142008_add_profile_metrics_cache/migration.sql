-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "metricsData" JSONB,
ADD COLUMN     "metricsFetchedAt" TIMESTAMP(3),
ADD COLUMN     "profileData" JSONB,
ADD COLUMN     "profileFetchedAt" TIMESTAMP(3);
