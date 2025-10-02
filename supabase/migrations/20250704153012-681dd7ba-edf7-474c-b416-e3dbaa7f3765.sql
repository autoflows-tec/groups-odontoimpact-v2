-- Enable realtime for Lista_de_Grupos table
ALTER TABLE public.Lista_de_Grupos REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.Lista_de_Grupos;