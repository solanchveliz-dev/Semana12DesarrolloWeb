// Datos de ejemplo para la biblioteca. Ejecutar con:  npm run db:seed
// Es seguro ejecutarlo varias veces: actualiza por email (autores) e ISBN (libros).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const data = [
  {
    name: "Gabriel García Márquez", email: "gabo@example.com", nationality: "Colombia", birthYear: 1927,
    bio: "Escritor, periodista y guionista colombiano, figura central del realismo mágico y Premio Nobel de Literatura en 1982.",
    books: [
      ["La hojarasca", 1955, "Novela", 128],
      ["El coronel no tiene quien le escriba", 1961, "Novela", 92],
      ["Cien años de soledad", 1967, "Novela", 417],
      ["Relato de un náufrago", 1970, "Periodismo", 110],
      ["Ojos de perro azul", 1972, "Cuento", 160],
      ["El otoño del patriarca", 1975, "Novela", 272],
      ["Crónica de una muerte anunciada", 1981, "Novela", 144],
      ["El amor en los tiempos del cólera", 1985, "Novela", 348],
      ["Doce cuentos peregrinos", 1992, "Cuento", 240],
      ["Noticia de un secuestro", 1996, "Periodismo", 336],
      ["Memoria de mis putas tristes", 2004, "Novela", 112],
    ],
  },
  {
    name: "Mario Vargas Llosa", email: "mvargas@example.com", nationality: "Perú", birthYear: 1936,
    bio: "Novelista y ensayista peruano, uno de los grandes nombres del boom latinoamericano y Premio Nobel de Literatura en 2010.",
    books: [
      ["La ciudad y los perros", 1963, "Novela", 410],
      ["La casa verde", 1966, "Novela", 432],
      ["Conversación en La Catedral", 1969, "Novela", 608],
      ["La tía Julia y el escribidor", 1977, "Novela", 447],
      ["La fiesta del Chivo", 2000, "Novela", 518],
    ],
  },
  {
    name: "Isabel Allende", email: "isabel@example.com", nationality: "Chile", birthYear: 1942,
    bio: "Escritora chilena, autora de algunas de las novelas en español más leídas en el mundo.",
    books: [
      ["La casa de los espíritus", 1982, "Novela", 448],
      ["De amor y de sombra", 1984, "Novela", 304],
      ["Eva Luna", 1987, "Novela", 320],
      ["Cuentos de Eva Luna", 1989, "Cuento", 288],
      ["Paula", 1994, "Memorias", 368],
      ["Retrato en sepia", 2000, "Novela", 336],
    ],
  },
  {
    name: "Jorge Luis Borges", email: "borges@example.com", nationality: "Argentina", birthYear: 1899,
    bio: "Escritor argentino de cuentos, ensayos y poesía, célebre por sus laberintos, espejos y bibliotecas infinitas.",
    books: [
      ["Ficciones", 1944, "Cuento", 203],
      ["El Aleph", 1949, "Cuento", 146],
      ["El hacedor", 1960, "Poesía", 128],
    ],
  },
  {
    name: "Julio Cortázar", email: "cortazar@example.com", nationality: "Argentina", birthYear: 1914,
    bio: "Escritor argentino, maestro del cuento fantástico y autor de una de las novelas más experimentales del siglo XX.",
    books: [
      ["Bestiario", 1951, "Cuento", 160],
      ["Rayuela", 1963, "Novela", 736],
    ],
  },
  {
    name: "Antoine de Saint-Exupéry", email: "saint-exupery@example.com", nationality: "Francia", birthYear: 1900,
    bio: "Escritor y aviador francés; sus experiencias de vuelo inspiraron buena parte de su obra.",
    books: [
      ["Vuelo nocturno", 1931, "Novela", 120],
      ["El Principito", 1943, "Fábula", 96],
    ],
  },
  {
    name: "George Orwell", email: "orwell@example.com", nationality: "Reino Unido", birthYear: 1903,
    bio: "Novelista y periodista británico, conocido por sus críticas al totalitarismo.",
    books: [
      ["Rebelión en la granja", 1945, "Fábula", 144],
      ["1984", 1949, "Distopía", 328],
    ],
  },
  {
    name: "César Vallejo", email: "vallejo@example.com", nationality: "Perú", birthYear: 1892,
    bio: "Poeta peruano, una de las voces más innovadoras de la poesía en lengua española.",
    books: [
      ["Los heraldos negros", 1918, "Poesía", 160],
      ["Trilce", 1922, "Poesía", 112],
    ],
  },
  {
    name: "Juan Rulfo", email: "rulfo@example.com", nationality: "México", birthYear: 1917,
    bio: "Escritor y fotógrafo mexicano; con muy pocos libros cambió la narrativa latinoamericana.",
    books: [
      ["El llano en llamas", 1953, "Cuento", 170],
      ["Pedro Páramo", 1955, "Novela", 124],
    ],
  },
];

async function main() {
  let n = 0;
  const base = Date.now() - 1000 * 60 * 60 * 24 * 30; // hace 30 días
  for (const a of data) {
    const { books, ...authorData } = a;
    const author = await prisma.author.upsert({
      where: { email: authorData.email },
      update: authorData,
      create: authorData,
    });
    for (const [title, publishedYear, genre, pages] of books) {
      n += 1;
      const isbn = `978-612-${String(n).padStart(5, "0")}`;
      const createdAt = new Date(base + n * 1000 * 60 * 60 * 12);
      await prisma.book.upsert({
        where: { isbn },
        update: { title, publishedYear, genre, pages, authorId: author.id },
        create: { title, publishedYear, genre, pages, isbn, authorId: author.id, createdAt, updatedAt: createdAt },
      });
    }
  }
  console.log(`Listo: ${data.length} autores y ${n} libros de ejemplo.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
