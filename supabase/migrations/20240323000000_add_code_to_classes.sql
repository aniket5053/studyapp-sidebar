-- Add code column to classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS code text;

-- Update existing rows to have a default code value
UPDATE public.classes SET code = name WHERE code IS NULL;

-- Make code column not null after setting default values
ALTER TABLE public.classes ALTER COLUMN code SET NOT NULL; 