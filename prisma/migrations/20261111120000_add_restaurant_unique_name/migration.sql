-- AlterTable: cria a coluna como opcional para conseguir preencher os registros existentes
ALTER TABLE "Restaurant" ADD COLUMN "normalizedName" VARCHAR(150);

-- Backfill: mesma regra do restaurant.service (trim + espaços colapsados + minúsculas)
UPDATE "Restaurant"
SET "normalizedName" = LOWER(BTRIM(REGEXP_REPLACE("name", '\s+', ' ', 'g')));

-- Agora todo registro tem valor: a coluna passa a ser obrigatória
ALTER TABLE "Restaurant" ALTER COLUMN "normalizedName" SET NOT NULL;

-- CreateIndex: se já houver nomes duplicados no banco, esta etapa falha
-- e os duplicados precisam ser resolvidos manualmente antes de aplicar
CREATE UNIQUE INDEX "Restaurant_normalizedName_key" ON "Restaurant"("normalizedName");
