// app.js
import express from "express";
import pkg from 'pg';
import bodyParser from "body-parser"; //이미지 값을 받아오기 위해 추가

const { Pool } = pkg;

// Postgres cluster hyun-diary-20240128 created
//   Username:    postgres
//   Password:    jG4HY5kmWklLxtm
//   Hostname:    hyun-diary-20240128.internal
//   Flycast:     fdaa:5:35c6:0:1::d
//   Proxy port:  5432
//   Postgres port:  5433
//   Connection string: postgres://postgres:jG4HY5kmWklLxtm@hyun-diary-20240128.flycast:5432

const pool = new Pool({
    user: 'postgres',
    password: 'jG4HY5kmWklLxtm',
    host: 'hyun-diary-20240128.internal',
    database: 'postgres',
    port: 5432,
  });

const app = express();
const port = 3000;

app.use(bodyParser.json()); //이미지 값을 받아오기 위해 추가
app.use(bodyParser.urlencoded({ extended: true })); //이미지 값을 받아오기 위해 추가

app.get("/", (req, res) => {
  res.send("TravelDiary Start!");
});

// 조회 traveldiary
app.get("/api/v1/diary", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM diarybackdb");
    const listrows = result.rows;

    res.json({
      resultCode: "S-1",
      msg: "성공",
      data: listrows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      resultCode: "F-1",
      msg: "에러 발생",
      error: error.toString(),
    });
  }
});

// 단건조회
app.get("/api/v1/diary/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query("SELECT * FROM diarybackdb WHERE id = $1", [
      id,
    ]);

    // 조회된 결과가 없을 경우 404 응답 반환
    if (result.rows.length === 0) {
      res.status(404).json({
        resultCode: "F-1",
        msg: "해당 ID가 없습니다",
      });
      return;
    }

    const listrow = result.rows[0];

    res.json({
      resultCode: "S-1",
      msg: "성공",
      data: listrow,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      resultCode: "F-1",
      msg: "에러 발생",
      error: error.toString(),
    });
  }
});

//삭제
app.delete("/api/v1/diary/:id", async (req, res) => {
  const { id } = req.params;

  const checkResult = await pool.query(
    "SELECT * FROM diarybackdb WHERE id = $1",
    [id]
  );
  const listrow = checkResult.rows[0];

  if (listrow === undefined) {
    res.status(404).json({
      resultCode: "F-1",
      msg: "not found",
    });
    return;
  }

  try {
    await pool.query("DELETE FROM diarybackdb WHERE id = $1", [id]);

    res.json({
      resultCode: "S-1",
      msg: `${id}번 여행지가 삭제되었습니다.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      resultCode: "F-1",
      msg: "에러 발생",
      error: error.toString(),
    });
  }
});

// 생성
app.post("/api/v1/diary", async (req, res) => {
  try {
    const { image, title, country, content } = req.body;

    if (!title) {
      res.status(400).json({
        resultCode: "F-1",
        msg: "title required",
      });
      return;
    }

    if (!country) {
      res.status(400).json({
        resultCode: "F-1",
        msg: "country required",
      });
      return;
    }

    if (!content) {
      res.status(400).json({
        resultCode: "F-1",
        msg: "content required",
      });
      return;
    }

    const result = await pool.query(
      "INSERT INTO diarybackdb (image, title, country, content) VALUES ($1, $2, $3, $4) RETURNING *",
      [image, title, country, content]
    );
    const recordrow = result.rows[0];

    res.json({
      resultCode: "S-1",
      msg: "성공",
      data: recordrow,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      resultCode: "F-1",
      msg: "에러 발생",
      error: error.toString(),
    });
  }
});

// 수정
app.patch("/api/v1/diary/:id", async (req, res) => {
  const { id } = req.params;
  const { image, title, country, content } = req.body;

  try {
    const checkResult = await pool.query(
      "SELECT * FROM diarybackdb WHERE id = $1",
      [id]
    );
    const listrow = checkResult.rows[0];

    if (listrow === undefined) {
      res.status(404).json({
        resultCode: "F-1",
        msg: "not found",
      });
      return;
    }

    await pool.query(
      "UPDATE diarybackdb SET image = $1, title = $2, country = $3, content = $4 WHERE id = $5",
      [image, title, country, content, id]
    );

    res.json({
      resultCode: "S-1",
      msg: "성공",
      data: listrow,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      resultCode: "F-1",
      msg: "에러 발생",
      error: error.toString(),
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});