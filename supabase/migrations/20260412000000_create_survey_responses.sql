CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  current_tools TEXT[] NOT NULL DEFAULT '{}',
  pain_points TEXT[] NOT NULL DEFAULT '{}',
  desired_features TEXT[] NOT NULL DEFAULT '{}',
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert survey responses"
  ON survey_responses FOR INSERT
  TO public
  WITH CHECK (true);
