CREATE TABLE ocorrencia (
    usuario_id INT PRIMARY KEY IDENTITY (1, 1),
    usuario VARCHAR (50) NOT NULL,
    tipo VARCHAR (13) NOT NULL CHECK (tipo IN('queimadas', 'caca', 'desmatamentos')),
    latitude DECIMAL (8, 6),
    longitude DECIMAL (9, 6)
)