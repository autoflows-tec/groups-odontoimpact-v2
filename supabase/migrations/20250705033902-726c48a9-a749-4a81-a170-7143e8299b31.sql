-- Enable Row Level Security for Lista_de_Grupos table
ALTER TABLE public."Lista_de_Grupos" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to Lista_de_Grupos
CREATE POLICY "Enable read access for all users" ON public."Lista_de_Grupos"
FOR SELECT USING (true);

-- Create policy to allow public insert access to Lista_de_Grupos
CREATE POLICY "Enable insert access for all users" ON public."Lista_de_Grupos"
FOR INSERT WITH CHECK (true);

-- Create policy to allow public update access to Lista_de_Grupos
CREATE POLICY "Enable update access for all users" ON public."Lista_de_Grupos"
FOR UPDATE USING (true);

-- Create policy to allow public delete access to Lista_de_Grupos
CREATE POLICY "Enable delete access for all users" ON public."Lista_de_Grupos"
FOR DELETE USING (true);