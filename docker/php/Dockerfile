FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
git \
curl \
unzip \
zip \
libpq-dev

RUN docker-php-ext-install \
pdo_pgsql \
pgsql \
opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# PHP + OPcache (CLI-enabled) settings
COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-php.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/zz-opcache.ini

# Ensure opcache file_cache dir exists before the server starts
RUN mkdir -p /tmp/opcache && chmod 777 /tmp/opcache

WORKDIR /var/www

COPY . .

RUN composer install

CMD ["php","artisan","serve","--host=0.0.0.0","--port=8000"]
