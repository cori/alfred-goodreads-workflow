const alfy = require("alfy");
const pify = require("pify");
const xml2js = require("xml2js");

const parseString = pify(xml2js.parseString);

alfy
  .fetch("https://www.goodreads.com/search/index.xml", {
    query: { q: alfy.input, key: "YVABuJSFNNFq65uTzRA8Nw" },
    json: false,
    transform: body =>
      parseString(body).then(
        body => body.GoodreadsResponse.search[0].results[0].work
      )
  })
  .then(books => {
    const items = books.map(book => {
      const { average_rating, best_book } = book;
      // this looks like garbage (and it is), but is necessary thanks to xml2js,
      // but it beats dealing with XML directly!
      const id = best_book[0].id[0]._;
      const title = best_book[0].title[0];
      const authorName = best_book[0].author[0].name;

      const rating = Math.round(average_rating);
      const fill = 5 - rating;
      const stars = `${"★".repeat(rating)}${"☆".repeat(fill)}`;
      const ratingText = `${stars} (${average_rating})`;
      const subtitle = `by ${authorName} | ${ratingText}`;

      return {
        title,
        subtitle,
        arg: `http://goodreads.com/book/show/${id}`
      };
    });
    alfy.output(items);
  });