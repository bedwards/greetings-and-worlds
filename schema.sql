CREATE TABLE IF NOT EXISTS greetings (
  id SERIAL PRIMARY KEY,
  text VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audiences (
  id SERIAL PRIMARY KEY,
  text VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS combos (
  id SERIAL PRIMARY KEY,
  greeting_id INTEGER NOT NULL REFERENCES greetings(id) ON DELETE CASCADE,
  audience_id INTEGER NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(greeting_id, audience_id)
);

CREATE INDEX IF NOT EXISTS idx_combos_greeting ON combos(greeting_id);
CREATE INDEX IF NOT EXISTS idx_combos_audience ON combos(audience_id);

INSERT INTO greetings (text) VALUES 
  ('Hello'),
  ('Hi'),
  ('Greetings')
ON CONFLICT (text) DO NOTHING;

INSERT INTO audiences (text) VALUES 
  ('World'),
  ('Universe'),
  ('Galaxy')
ON CONFLICT (text) DO NOTHING;

INSERT INTO combos (greeting_id, audience_id) 
SELECT g.id, a.id 
FROM greetings g, audiences a 
WHERE g.text = 'Hello' AND a.text = 'World'
ON CONFLICT (greeting_id, audience_id) DO NOTHING;
