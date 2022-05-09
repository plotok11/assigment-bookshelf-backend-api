const {nanoid} = require('nanoid');
const books = require('./bookshelf.js');

const addBooksHandler = (request, h) => {
    const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;
  
    // Client tidak melampirkan properti name pada request body
    if (!name) {
      const response = h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        })
        response.code(400);
        return response;
    }
  
    // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount.
    if (readPage > pageCount) {
      const response = h.response({
          status: 'fail',
          message:
            'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        })
        response.code(400);
        return response;
    }
  
    const id = nanoid(16);
    const finished = pageCount === readPage;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
  
    const newBook = {name, year, author, summary, publisher, pageCount, readPage, reading, id, finished, insertedAt, updatedAt,};
  
    books.push(newBook);
  
    const isSuccess = books.filter((book) => book.id === id).length > 0;
  
    // Bila buku berhasil dimasukkan
    if (isSuccess) {
      const response = h
        .response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        })
        .code(201);
      return response;
    }
  
    // Server gagal memasukkan buku karena alasan umum (generic error).
    const response = h
      .response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
      })
      .code(500);
    return response;
  };

const getAllBooksHandler = (request, h) => {
    const {name, reading, finished} = request.query;

    if(!name && !reading && !finished){
        const response = h.response({
            status: 'success',
            data: {
                books: books.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher
                })),
            },
        });

        response.code(200);
        return response;
    }

    // Tampilkan seluruh buku yang mengandung nama berdasarkan nilai yang diberikan pada query ini
    if(name !== undefined) {
        const book = books.filter((book) => {
            book.name.toLowerCase().includes(name.toLowerCase())
        });

        const response = h.response({
            status: 'success',
            data: {
                books: book.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher
                })),
            },
        });

        response.code(200);
        return response;
    }

    // Bernilai 0 atau 1. Bila 0, tampilkan buku yang sedang tidak dibaca (reading: false).
    if (reading !== undefined) {
        const book = books.filter(
            (book) => Number(book.reading) === Number(reading),
        );
    
        const response = h.response({
          status: 'success',
          data: {
            books: book.map((book) => ({
              id: book.id,
              name: book.name,
              publisher: book.publisher,
            }),
            ),
          },
        });
    
        response.code(200);
        return response;
    }

    // Bernilai 0 atau 1. Bila 0, tampilkan buku yang sudah belum selesai dibaca (finished: false). 
    if (finished !== undefined) {
        const book = books.filter(
            (book) => Number(book.finished) === Number(finished),
        );
    
        const response = h.response({
          status: 'success',
          data: {
            books: book.map((book) => ({
              id: book.id,
              name: book.name,
              publisher: book.publisher,
            }),
            ),
          },
        });
    
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'success',
        data: {
          books: books.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          }),
          ),
        },
      });
    
      response.code(200);
      return response;
    
};

const getBooksByIdHandler = (request, h) => {
    const {bookId} = request.params;
    const book = books.filter((book) => book.id === bookId)[0];
  
    // Bila buku dengan id yang dilampirkan ditemukan
    if (book !== undefined) {
      const response = h.response({
        status: 'success',
        data: {
          book,
        },
      },
      );
  
      response.code(200);
      return response;
    }
  
    // Bila buku dengan id yang dilampirkan oleh client tidak ditemukan
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
  
    response.code(404);
    return response;
  };
  
const editBooksByIdHandler = (request, h) => {
    const {bookId} = request.params;
    const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;
  
    // Client tidak melampirkan properti name pada request body
    if (!name) {
      const response = h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        })
        response.code(400);
        return response;
    }
  
    // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount.
    if (readPage > pageCount) {
      const response = h.response({
          status: 'fail',
          message:
            'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        })
        response.code(400);
        return response;
    }

    const finished = pageCount === readPage;
    const updatedAt = new Date().toISOString();

    const index = books.findIndex((book) => book.id === bookId);

    // Bila buku berhasil diperbarui
    if(index !== -1){
        books[index] = {
            ...books[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            finished,
            updatedAt
        };

        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui'
        });

        response.code(200);
        return response;
    }

    // Id yang dilampirkan oleh client tidak ditemukkan oleh server
    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan'
    });

    response.code(404);
    return response;
    
}

const deleteBooksByIdHandler = (request, h) => {
    const {bookId} = request.params;
    const index = books.findIndex((book) => book.id === bookId);

    // Bila id dimiliki oleh salah satu buku
    if(index !== -1){
        books.splice(index, 1);
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus'
        });

        response.code(200);
        return response;
    }

    // Bila id yang dilampirkan tidak dimiliki oleh buku mana pun
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan'
    });

    response.code(404);
    return response;
}

module.exports = {addBooksHandler, getAllBooksHandler, getBooksByIdHandler, editBooksByIdHandler, deleteBooksByIdHandler};