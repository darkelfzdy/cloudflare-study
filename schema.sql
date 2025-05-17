CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    author TEXT
);

INSERT INTO quotes (text, author) VALUES
('The only way to do great work is to love what you do.', 'Steve Jobs'),
('Strive not to be a success, but rather to be of value.', 'Albert Einstein'),
('The mind is everything. What you think you become.', 'Buddha'),
('路漫漫其修远兮，吾将上下而求索。', '屈原'),
('温故而知新，可以为师矣。', '孔子');