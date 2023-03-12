<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API

1.- Clone this repository using the following git command 
```
git clone https://github.com/GMartinez0210/TesloDB-TypeORM-Relation.git
```

2.- Install the all dependencies.
```
npm install
```

3.- Copy the `.env.template` file and change its name to `.env` and replace the variables with your own variables

4.- Run the following command to up the database
```
docker-compose up -d
```

5.- Run the complete app with `npm run start:dev`
```
npm run start:dev
```

6.- Run the endpoint `seed` to get an initial data (optional)
```
http://localhost:3000/api/seed
```