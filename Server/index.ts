const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.json([
    {
      id: "1",
      language: "JavaScript",
      use: "Javascript is used by programmers across the world to create dynamic and interactive web content like applications and browsers.",
      invented: "JavaScript was invented by Brendan Eich in 1995",
    },
    {
      id: "2",
      language: "Python",
      use: "Python is a computer programming language often used to build websites and software, automate tasks, and conduct data analysis",
      invented:
        "Python was created by Guido van Rossum, and first released on February 20, 1991",
    },
    {
      id: "3",
      language: "Go",
      use: "Go (also called Golang or Go language) is an open source programming language used for general purpose. Go was developed by Google engineers to create dependable and efficient software.",
      invented:
        "Go was developed by Google Engineers on the 10th of November 2009",
    },
    {
      id: "4",
      language: "Ruby",
      use: "Ruby is mainly used to build web applications and is useful for other programming projects. It is widely used for building servers and data processing, web scraping, and crawling. The leading framework used to run Ruby is Ruby on Rails, although that's not the only one.",
      invented:
        "Ruby was publicly released in 1995, but it didn't quite achieve mass acceptance until much later in 2006",
    },
    {
      id: "5",
      language: "Java",
      use: "Developers use Java to construct applications in laptops, data centres, game consoles, scientific supercomputers, cell phones, and other devices.",
      invented:
        "Java was first released in 1995, and Java's ability to provide interactivity and multimedia showed that it was particularly well suited for the Web.",
    },
  ]);
});

app.get("/tutorials", (req, res) => {
  res.json([
    {
      id: "1",
      language: "JavaScript",
      use: "Javascript is used by programmers across the world to create dynamic and interactive web content like applications and browsers.",
      invented: "JavaScript was invented by Brendan Eich in 1995",
    },
    {
      id: "2",
      language: "Python",
      use: "Python is a computer programming language often used to build websites and software, automate tasks, and conduct data analysis",
      invented:
        "Python was created by Guido van Rossum, and first released on February 20, 1991",
    },
    {
      id: "3",
      language: "Go",
      use: "Go (also called Golang or Go language) is an open source programming language used for general purpose. Go was developed by Google engineers to create dependable and efficient software.",
      invented:
        "Go was developed by Google Engineers on the 10th of November 2009",
    },
    {
      id: "4",
      language: "Ruby",
      use: "Ruby is mainly used to build web applications and is useful for other programming projects. It is widely used for building servers and data processing, web scraping, and crawling. The leading framework used to run Ruby is Ruby on Rails, although that's not the only one.",
      invented:
        "Ruby was publicly released in 1995, but it didn't quite achieve mass acceptance until much later in 2006",
    },
    {
      id: "5",
      language: "Java",
      use: "Developers use Java to construct applications in laptops, data centres, game consoles, scientific supercomputers, cell phones, and other devices.",
      invented:
        "Java was first released in 1995, and Java's ability to provide interactivity and multimedia showed that it was particularly well suited for the Web.",
    },
  ]);
});

app.listen(4000, () => {
  console.log("listening for requests on port 4000");
});
