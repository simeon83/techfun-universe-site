const { DateTime } = require("luxon");
const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLLL d, yyyy");
  });

  eleventyConfig.addCollection("blogPosts", (collectionApi) => {
    return collectionApi.getFilteredByTag("blogpost").sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("portfolioItems", (collectionApi) => {
    return collectionApi.getFilteredByTag("portfolioItem");
  });

  eleventyConfig.addCollection("testimonials", (collectionApi) => {
    return collectionApi.getFilteredByTag("testimonial");
  });

  eleventyConfig.addCollection("faqItems", (collectionApi) => {
    return collectionApi.getFilteredByTag("faqItem").sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
