const cheerio = require("cheerio");
const axios = require("axios");
const j2csv = require("json2csv").Parser;
const fs = require("fs");

const url = "https://scrapeme.live/shop/";
const baseUrl = "https://scrapeme.live/shop/";
const product_data = [];

async function getProducts(pageCount) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const products = $("li.product"); // Select all product elements

    products.each(function (index, element) {
      const title = $(element)
        .find(".woocommerce-loop-product__title")
        .text()
        .trim();
      const price = $(element).find(".price").text().trim();

      // Push each product as an object with title and price to the product_data array
      product_data.push({ title, price });
    });

    if (pageCount < 5 && $(".next.page-numbers").length > 0) {
      const next_page = baseUrl + $(".next.page-numbers").attr("href");
      await getProducts(pageCount + 1, next_page);
    } else {
      const parser = new j2csv();
      const csv = parser.parse(product_data);
      fs.writeFileSync("./product.csv", csv);
      console.log(product_data);
    }
  } catch (error) {
    console.error(error);
  }
}

// Use .then() to handle the promise if not in an async context
getProducts(0).then(() => console.log("Scraping completed."));
