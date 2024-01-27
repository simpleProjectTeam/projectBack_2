// app.js
import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser"; //이미지 값을 받아오기 위해 추가

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "traveldiary",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const app = express();
const port = 3000;

app.use(bodyParser.json()); //이미지 값을 받아오기 위해 추가
app.use(bodyParser.urlencoded({ extended: true })); //이미지 값을 받아오기 위해 추가

app.get("/", (req, res) => {
  res.send("TravelDiary Start!");
});

// 조회
app.get("/traveldiary", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM traveldiary ORDER BY id DESC");

  res.json(rows);
});

// 단건 조회
app.get("/traveldiary/:id", async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query("SELECT * FROM traveldiary WHERE id = ?", [
    id,
  ]);

  if (rows.length == 0) {
    res.status(404).send("not found");
    return;
  }

  res.json(rows[0]);
});

// 등록
app.post("/traveldiary", async (req, res) => {
  const { image, title, country, content } = req.body;

  if (!image) {
    res.status(400).json({
      msg: "author image",
    });
    return;
  }

  if (!title) {
    res.status(400).json({
      msg: "content title",
    });
    return;
  }

  if (!country) {
    res.status(400).json({
      msg: "content country",
    });
    return;
  }
  
  if (!content) {
    res.status(400).json({
      msg: "content content",
    });
    return;
  }

  
    const [rs] = await pool.query(
      `
      INSERT INTO traveldiary
        SET image = ?,
        title = ?,
        country = ?,
        content = ?
      `,
      [image, title, country, content]
    );

    res.status(201).json({
      id: rs.insertId,
    });
  });

//삭제
app.delete("/traveldiary/:id", async (req, res) => {
  const { id } = req.params;

  const [rows] = await pool.query("SELECT * FROM traveldiary WHERE id = ?", [
    id,
  ]);

  if (rows.length == 0) {
    res.status(404).send("not found");
    return;
  }

  const [rs] = await pool.query(
    `
    DELETE FROM traveldiary
    WHERE id = ?
    `,
    [id]
  );

  res.status(200).json({
    id,
  });
});

//수정
app.patch("/traveldiary/:id", async (req, res) => {
  const { id } = req.params;

  const { image, title, country, content } = req.body;

  const [rows] = await pool.query("SELECT * FROM traveldiary WHERE id = ?", [
    id,
  ]);

  if (rows.length == 0) {
    res.status(404).send("not found");
    return;
  }

  if (!image) {
    res.status(400).json({
      msg: "image required",
    });
    return;
  }

  if (!title) {
    res.status(400).json({
      msg: "title required",
    });
    return;
  }

  if (!country) {
    res.status(400).json({
      msg: "country required",
    });
    return;
  }

  if (!content) {
    res.status(400).json({
      msg: "content required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    UPDATE traveldiary
    SET 
    image = ?,
    title = ?,
    country = ?,
    content = ?
    `,
    [image, title, country, content,]
  );

  res.status(200).json({
    id,
    image,
    title,
    country,
    content,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});