== README
```
docker-compose build
docker-compose up rabbitmq redis db nginx
# wait for the services to start
docker-compose up app worker1 perform
```

then go to `http://localhost:4000`

Check http://equinox.one/blog/2016/04/20/Docker-with-Ruby-on-Rails-in-development-and-production/