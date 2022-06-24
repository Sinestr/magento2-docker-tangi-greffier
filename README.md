# IIA - Isoler une application Magento avec Docker

Conteneurisation d'un projet natif __Magento 2.3.7__ 

---------------

Services  utilisés : 

* Nginx 1.14
* PHP 7.4-fpm-buster
* Mariadb 10.4
* phpmyadmin
* elasticsearch 7.9.3
* redis

---------------

1. Cloner le projet git
```
git clone --recursive https://github.com/Sinestr/magento2-docker-tangi-greffier.git
```

2. Monter le projet docker (se rendre dans le répertoire ./run)
```
docker build
docker-compose up -d
```

```
docker ps
   b795536efa09   nginx:1.14-alpine               "nginx -g 'daemon of…"   20 hours ago   Up 20 hours   0.0.0.0:80->80/tcp                               m2_nginx_1
   05d11e0d631f   phpmyadmin:latest               "/docker-entrypoint.…"   20 hours ago   Up 20 hours   0.0.0.0:8080->80/tcp                             m2_phpmyadmin_1
   77d0309f16e0   redislabs/redisinsight:latest   "bash ./docker-entry…"   20 hours ago   Up 20 hours   0.0.0.0:8001->8001/tcp                           m2_redisinsight_1
   95782dd7ec98   run_php                         "docker-php-entrypoi…"   20 hours ago   Up 20 hours   0.0.0.0:9000->9000/tcp                           m2_php_1
   6226c3466ebe   elasticsearch:7.9.3             "/tini -- /usr/local…"   20 hours ago   Up 20 hours   0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   m2_elasticsearch_1
   14f540f03708   mariadb:10.4                    "docker-entrypoint.s…"   20 hours ago   Up 20 hours   0.0.0.0:3306->3306/tcp                           m2_db_1
   ebf32f662407   redis:latest                    "docker-entrypoint.s…"   20 hours ago   Up 20 hours   6379/tcp                                         m2_redis_1
````

3. Installer le Magento 2 (se rendre dans le répertoire ./htdocs)
```
php bin/magento setup:install --base-url=http://dopelore.local/ --db-host=localhost --db-name=localdb --db-user=dopelore --db-password=docker --admin-firstname=Tangi --admin-lastname=GREFFIER --admin-email=tangigreffier@gmail.com --admin-user=dopelore --admin-password=P@ssw0rd --language=fr_FR --currency=EUR --timezone=Europe/Paris --cleanup-database --sales-order-increment-prefix="ORD$" --session-save=db --use-rewrites=1
````

4. Se rendre sur son navigateur web préféré et se rendre sur le lien : http://dopelore.local/
