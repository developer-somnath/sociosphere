FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
git \
curl \
unzip \
zip \
libpq-dev

RUN docker-php-ext-install \
pdo_pgsql \
pgsql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install

CMD ["php","artisan","octane:start","--server=roadrunner","--host=0.0.0.0","--port=8000"]
