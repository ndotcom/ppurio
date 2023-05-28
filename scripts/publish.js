const execa = require("execa");

(async () => {
  try {
    await execa("git", ["push", "--follow-tags"]);
    await execa("npm", ["publish"]);
  } catch (error) {
    console.error(error);
  }
})();
