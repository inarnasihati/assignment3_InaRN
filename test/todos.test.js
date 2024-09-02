const request = require("supertest");
const app = require("../app");
const { Todo, User, sequelize } = require("../models");
const jwt = require('jsonwebtoken');


let token;
let todos;

beforeAll(async () => {
  try {
    // create user & get token first
    const user = await User.create({
      email: "ina_rn@mail.com",
      password: "testrahasia",
    });

    token = jwt.sign({ email: user.email, password: user.password }, 'your_secret_key', { expiresIn: '1h' });
    console.log('Generated Token:', token);
  
  } catch (error) {
    console.log(error);
  }
});

/*afterAll(async () => {
  //await Todo.destroy({ truncate: true});
  await User.destroy({ truncate: true, cascade: true });
  await sequelize.close();
});*/
afterAll(async () => {
    try {
      await Promise.all([
        User.destroy({ truncate: true, cascade: true })
      ]);
  
      console.log('Cleanup completed.');
  
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      await sequelize.close();
      console.log('Database connection closed.');
    }
});

describe("Todos resource", () => {
 it("Should not be able to get all todos when token is not provided", async () => {
    const response = await request(app)
      .get("/todos")
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("unauthorized");
  });

  it("Should be able to get all todos", async () => {
    const response = await request(app)
      .get("/todos")
      .set("Content-Type", "application/json")
      .auth(token, { type: "bearer" });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

});
