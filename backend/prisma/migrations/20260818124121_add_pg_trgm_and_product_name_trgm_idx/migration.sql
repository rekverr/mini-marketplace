-- Add pg_trgm extension and a trigram GIN index for product name search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram index to accelerate ILIKE/contains searches on product name
CREATE INDEX IF NOT EXISTS product_name_trgm_idx ON "Product" USING GIN (name gin_trgm_ops);
